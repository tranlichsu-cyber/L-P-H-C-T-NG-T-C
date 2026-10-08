import type {
  MockRoomData,
  CreateRoomParams,
  SubmitAnswerParams,
  LiveQuestionPublic,
  MockSubmission,
  MockParticipant,
  RealtimeEvent,
  GameType,
  GameSessionData,
} from './types';
import { loadMockDatabase, saveMockDatabase, getRoomById, getRoomByCode } from './mockStorage';
import { eventBus } from './broadcastChannel';
import { buildInitialGameSession } from './gameHelpers';

export class MockRealtimeService {
  // 1. Create Room (Teacher)
  public createRoom(params: CreateRoomParams): MockRoomData {
    const db = loadMockDatabase();

    const roomId = `room-${Date.now()}`;
    const roomCode = String(Math.floor(100000 + Math.random() * 900000));
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 12 * 3600 * 1000).toISOString();

    // Store private answers securely
    const privateAnswers: Record<string, { correctAnswer: string; explanation?: string }> = {};
    const liveQuestions: Record<string, LiveQuestionPublic> = {};

    params.questions.forEach((q) => {
      privateAnswers[q.id] = {
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      };

      // Initial public question state (READY)
      liveQuestions[q.id] = {
        id: q.id,
        type: q.type,
        content: q.content,
        options: q.options ? [...q.options] : undefined,
        status: 'READY',
      };
    });

    const rosterItems = params.roster.map((r) => ({
      id: r.id,
      studentId: r.id,
      name: r.name,
    }));

    const newRoom: MockRoomData = {
      id: roomId,
      roomCode,
      teacherId: params.teacherId,
      classId: params.classId,
      className: params.className,
      subject: params.subject,
      quizId: params.quizId,
      quizTitle: params.quizTitle,
      status: 'WAITING',
      activeQuestionId: params.questions[0]?.id || null,
      createdAt: now,
      expiresAt,
      roster: rosterItems,
      participants: {},
      liveQuestions,
      submissions: {},
      scores: {},
      scoreEvents: {},
      calledStudent: null,
      callHistory: [],
    };

    db.rooms[roomId] = newRoom;
    db.privateQuestions[roomId] = privateAnswers;
    saveMockDatabase(db);

    eventBus.publish({
      type: 'ROOM_UPDATED',
      roomId,
      payload: newRoom,
      timestamp: now,
    });

    return newRoom;
  }

  // 2. Join Room by Code (Student)
  public joinRoomByCode(code: string): { room: MockRoomData | null; error?: string } {
    const room = getRoomByCode(code);
    if (!room) {
      return { room: null, error: 'Không tìm thấy phòng học hoặc phòng đã kết thúc.' };
    }

    if (new Date().toISOString() > room.expiresAt) {
      return { room: null, error: 'Phòng học đã hết hạn.' };
    }

    return { room };
  }

  // 3. Register Participant (Student)
  public joinParticipant(
    roomId: string,
    studentId: string,
    name: string,
    mockAuthUid: string
  ): { participant: MockParticipant | null; error?: string } {
    const db = loadMockDatabase();
    const room = db.rooms[roomId];
    if (!room) return { participant: null, error: 'Phòng không tồn tại.' };

    const now = new Date().toISOString();
    const participant: MockParticipant = {
      studentId,
      name,
      mockAuthUid,
      sessionToken: `token-${Date.now()}`,
      joinedAt: now,
      lastSeenAt: now,
    };

    room.participants[studentId] = participant;
    saveMockDatabase(db);

    eventBus.publish({
      type: 'PARTICIPANT_JOINED',
      roomId,
      payload: participant,
      timestamp: now,
    });

    return { participant };
  }

  // 4. Start Room Session (Teacher: WAITING -> ACTIVE)
  public startRoomSession(roomId: string): boolean {
    const db = loadMockDatabase();
    const room = db.rooms[roomId];
    if (!room || room.status === 'FINISHED') return false;

    room.status = 'ACTIVE';
    saveMockDatabase(db);

    eventBus.publish({
      type: 'ROOM_UPDATED',
      roomId,
      payload: room,
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  // 5. Open Question (Teacher: READY/CLOSED -> OPEN)
  public openQuestion(roomId: string, questionId: string): boolean {
    const db = loadMockDatabase();
    const room = db.rooms[roomId];
    if (!room || room.status === 'FINISHED') return false;

    const liveQ = room.liveQuestions[questionId];
    if (!liveQ) return false;

    // Enforce Privacy: Omit correctAnswer & explanation
    liveQ.status = 'OPEN';
    liveQ.startedAt = new Date().toISOString();
    delete liveQ.correctAnswer;
    delete liveQ.explanation;

    room.activeQuestionId = questionId;
    room.status = 'ACTIVE';
    saveMockDatabase(db);

    eventBus.publish({
      type: 'QUESTION_OPENED',
      roomId,
      payload: { activeQuestionId: questionId, liveQuestion: liveQ },
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  // 6. Close Question (Teacher: OPEN -> CLOSED)
  public closeQuestion(roomId: string, questionId: string): boolean {
    const db = loadMockDatabase();
    const room = db.rooms[roomId];
    if (!room) return false;

    const liveQ = room.liveQuestions[questionId];
    if (!liveQ || liveQ.status !== 'OPEN') return false; // Enforce State Machine

    liveQ.status = 'CLOSED';
    saveMockDatabase(db);

    eventBus.publish({
      type: 'QUESTION_CLOSED',
      roomId,
      payload: { questionId, liveQuestion: liveQ },
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  // 7. Show Question Result (Teacher: CLOSED -> RESULT) with Idempotent Auto-Scoring
  public showQuestionResult(roomId: string, questionId: string): boolean {
    const db = loadMockDatabase();
    const room = db.rooms[roomId];
    if (!room) return false;

    const liveQ = room.liveQuestions[questionId];
    if (!liveQ || liveQ.status !== 'CLOSED') return false; // Enforce State Machine (CLOSED -> RESULT)

    const privateAns = db.privateQuestions[roomId]?.[questionId];
    if (!privateAns) return false;

    // ATTACH PRIVATE ANSWER AT RESULT MOMENT ONLY
    liveQ.status = 'RESULT';
    liveQ.correctAnswer = privateAns.correctAnswer;
    liveQ.explanation = privateAns.explanation;

    // Idempotent Auto-Scoring for correct submissions
    if (!room.scores) room.scores = {};
    if (!room.scoreEvents) room.scoreEvents = {};

    const submissions = Object.values(room.submissions).filter((s) => s.questionId === questionId);
    const targetCorrect = privateAns.correctAnswer.trim().toLowerCase();

    submissions.forEach((sub) => {
      const isCorrect = sub.answer.trim().toLowerCase() === targetCorrect;
      if (isCorrect) {
        const eventId = `question_${questionId}_student_${sub.studentId}`;
        // Enforce Idempotency: Only award points if event does NOT already exist
        if (!room.scoreEvents[eventId]) {
          const now = new Date().toISOString();
          room.scoreEvents[eventId] = {
            id: eventId,
            studentId: sub.studentId,
            type: 'QUESTION_CORRECT',
            points: 10,
            questionId,
            createdAt: now,
          };

          const currentScore = room.scores[sub.studentId]?.score || 0;
          room.scores[sub.studentId] = {
            studentId: sub.studentId,
            studentName: sub.studentName,
            score: currentScore + 10,
            updatedAt: now,
          };
        }
      }
    });

    saveMockDatabase(db);

    eventBus.publish({
      type: 'QUESTION_RESULT',
      roomId,
      payload: { questionId, liveQuestion: liveQ, scores: room.scores },
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  // 7b. Add Manual Score (Teacher)
  public addManualScore(
    roomId: string,
    studentId: string,
    studentName: string,
    points: number,
    reason?: string
  ): boolean {
    const db = loadMockDatabase();
    const room = db.rooms[roomId];
    if (!room) return false;

    if (!room.scores) room.scores = {};
    if (!room.scoreEvents) room.scoreEvents = {};

    const now = new Date().toISOString();
    const eventId = `manual_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    room.scoreEvents[eventId] = {
      id: eventId,
      studentId,
      type: 'MANUAL',
      points,
      reason,
      createdAt: now,
      createdBy: room.teacherId,
    };

    const currentScore = room.scores[studentId]?.score || 0;
    const newScore = Math.max(0, currentScore + points);

    room.scores[studentId] = {
      studentId,
      studentName,
      score: newScore,
      updatedAt: now,
    };

    saveMockDatabase(db);

    eventBus.publish({
      type: 'SCORE_UPDATED',
      roomId,
      payload: { studentId, score: newScore, scores: room.scores },
      timestamp: now,
    });

    return true;
  }

  // 7c. Call Student (Teacher)
  public callStudent(roomId: string, studentId: string, studentName: string, reason?: string): boolean {
    const db = loadMockDatabase();
    const room = db.rooms[roomId];
    if (!room) return false;

    if (!room.callHistory) room.callHistory = [];
    if (!room.callHistory.includes(studentId)) {
      room.callHistory.push(studentId);
    }

    const now = new Date().toISOString();
    const nextSeq = (room.calledStudent?.callSequence || 0) + 1;

    room.calledStudent = {
      studentId,
      studentName,
      calledAt: now,
      reason,
      callSequence: nextSeq,
    };

    saveMockDatabase(db);

    eventBus.publish({
      type: 'STUDENT_CALLED',
      roomId,
      payload: room.calledStudent,
      timestamp: now,
    });

    return true;
  }

  // 7d. Clear Called Student
  public clearCalledStudent(roomId: string): boolean {
    const db = loadMockDatabase();
    const room = db.rooms[roomId];
    if (!room) return false;

    room.calledStudent = null;
    saveMockDatabase(db);

    eventBus.publish({
      type: 'ROOM_UPDATED',
      roomId,
      payload: room,
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  // 7e. Reset Call History
  public resetCallHistory(roomId: string): boolean {
    const db = loadMockDatabase();
    const room = db.rooms[roomId];
    if (!room) return false;

    room.callHistory = [];
    saveMockDatabase(db);
    return true;
  }

  // 8. Submit Answer (Student)
  public submitAnswer(params: SubmitAnswerParams): { success: boolean; error?: string } {
    const db = loadMockDatabase();
    const room = db.rooms[params.roomId];
    if (!room) return { success: false, error: 'Phòng không tồn tại.' };

    const liveQ = room.liveQuestions[params.questionId];
    if (!liveQ) return { success: false, error: 'Câu hỏi không tồn tại.' };

    // RACE CONDITION CHECK: Status MUST be OPEN at moment of submission
    if (liveQ.status !== 'OPEN') {
      return { success: false, error: 'Câu hỏi đã đóng nhận câu trả lời.' };
    }

    // DUPLICATE CHECK: Idempotency Key questionId_studentId
    const submissionId = `${params.questionId}_${params.studentId}`;
    if (room.submissions[submissionId]) {
      return { success: false, error: 'Em đã nộp câu trả lời cho câu hỏi này rồi.' };
    }

    const submission: MockSubmission = {
      id: submissionId,
      questionId: params.questionId,
      studentId: params.studentId,
      studentName: params.studentName,
      mockAuthUid: params.mockAuthUid,
      answer: params.answer.trim(),
      submittedAt: new Date().toISOString(),
    };

    room.submissions[submissionId] = submission;
    saveMockDatabase(db);

    eventBus.publish({
      type: 'SUBMISSION_CREATED',
      roomId: params.roomId,
      payload: submission,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  // 9. Next Question Transition (Teacher)
  public nextQuestion(roomId: string, nextQuestionId: string): boolean {
    const db = loadMockDatabase();
    const room = db.rooms[roomId];
    if (!room) return false;

    room.activeQuestionId = nextQuestionId;
    saveMockDatabase(db);

    eventBus.publish({
      type: 'ROOM_UPDATED',
      roomId,
      payload: room,
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  // 10. Finish Room (Teacher: ACTIVE -> FINISHED)
  public finishRoom(roomId: string): boolean {
    const db = loadMockDatabase();
    const room = db.rooms[roomId];
    if (!room) return false;

    const finishedAt = new Date().toISOString();
    room.status = 'FINISHED';
    room.finishedAt = finishedAt;
    saveMockDatabase(db);

    // Automatically generate idempotent session summary
    import('../history/HistoryService').then(({ HistoryService }) => {
      HistoryService.saveSessionSummary(room, db.privateQuestions[roomId]);
    });

    eventBus.publish({
      type: 'ROOM_FINISHED',
      roomId,
      payload: room,
      timestamp: finishedAt,
    });

    return true;
  }

  // 11. GAME CONTROL METHODS (Milestone 7)
  public createGameSession(
    roomId: string,
    type: GameType,
    settings: GameSessionData['settings'],
    questionIds: string[]
  ): GameSessionData | null {
    const db = loadMockDatabase();
    const room = db.rooms[roomId];
    if (!room) return null;

    const participants = Object.values(room.participants || {});
    const game = buildInitialGameSession(roomId, type, settings, questionIds, participants);

    room.activeGameId = game.id;
    room.activeGame = game;

    saveMockDatabase(db);

    eventBus.publish({
      type: 'GAME_STARTED',
      roomId,
      payload: game,
      timestamp: new Date().toISOString(),
    });

    return game;
  }

  public startGameSession(roomId: string): boolean {
    const db = loadMockDatabase();
    const room = db.rooms[roomId];
    if (!room || !room.activeGame) return false;

    room.activeGame.status = 'RUNNING';
    room.activeGame.startedAt = new Date().toISOString();
    room.activeGame.roundStartedAt = new Date().toISOString();

    saveMockDatabase(db);

    eventBus.publish({
      type: 'GAME_UPDATED',
      roomId,
      payload: room.activeGame,
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  public pauseGameSession(roomId: string): boolean {
    const db = loadMockDatabase();
    const room = db.rooms[roomId];
    if (!room || !room.activeGame) return false;

    const currentStatus = room.activeGame.status;
    room.activeGame.status = currentStatus === 'PAUSED' ? 'RUNNING' : 'PAUSED';

    saveMockDatabase(db);

    eventBus.publish({
      type: 'GAME_PAUSED',
      roomId,
      payload: room.activeGame,
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  public finishGameSession(roomId: string): boolean {
    const db = loadMockDatabase();
    const room = db.rooms[roomId];
    if (!room) return false;

    if (room.activeGame) {
      room.activeGame.status = 'FINISHED';
      room.activeGame.endedAt = new Date().toISOString();
    }

    room.activeGameId = null;
    room.activeGame = null;

    saveMockDatabase(db);

    eventBus.publish({
      type: 'GAME_FINISHED',
      roomId,
      payload: null,
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  public updateGamePayload(roomId: string, updateFn: (game: GameSessionData) => GameSessionData): boolean {
    const db = loadMockDatabase();
    const room = db.rooms[roomId];
    if (!room || !room.activeGame) return false;

    room.activeGame = updateFn({ ...room.activeGame });
    saveMockDatabase(db);

    eventBus.publish({
      type: 'GAME_UPDATED',
      roomId,
      payload: room.activeGame,
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  // --- SUBSCRIPTIONS ---
  public subscribeRoom(roomId: string, callback: (room: MockRoomData) => void): () => void {
    // Immediate initial push
    const initial = getRoomById(roomId);
    if (initial) callback(initial);

    return eventBus.subscribe((e: RealtimeEvent) => {
      if (e.roomId === roomId) {
        const updated = getRoomById(roomId);
        if (updated) callback(updated);
      }
    });
  }

  public subscribeStudentRoom(
    roomId: string,
    studentId: string,
    callback: (room: MockRoomData) => void
  ): () => void {
    const emitStudentView = () => {
      const room = getRoomById(roomId);
      if (!room) return;

      const activeQuestionId = room.activeQuestionId;
      const liveQuestions = activeQuestionId && room.liveQuestions[activeQuestionId]
        ? { [activeQuestionId]: room.liveQuestions[activeQuestionId] }
        : {};
      const submissions = Object.fromEntries(
        Object.entries(room.submissions || {}).filter(([, submission]) =>
          submission.studentId === studentId
        )
      );
      const scores = room.scores?.[studentId]
        ? { [studentId]: room.scores[studentId] }
        : {};

      callback({
        ...room,
        rosterCount: room.rosterCount ?? room.roster.length,
        participantCount:
          room.participantCount ?? Object.keys(room.participants || {}).length,
        roster: [],
        participants: {},
        liveQuestions,
        submissions,
        scores,
        scoreEvents: {},
      });
    };

    emitStudentView();

    return eventBus.subscribe((event: RealtimeEvent) => {
      if (event.roomId === roomId) emitStudentView();
    });
  }
}

export const realtimeService = new MockRealtimeService();
