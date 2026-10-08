import {
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  limit,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  runTransaction,
  increment,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import type {
  MockRoomData,
  CreateRoomParams,
  SubmitAnswerParams,
  LiveQuestionPublic,
  MockSubmission,
  MockParticipant,
  GameType,
  GameSessionData,
  ScoreEvent,
} from '../realtime/types';
import { buildInitialGameSession } from '../realtime/gameHelpers';
import { SessionAnalysisService } from '../history/SessionAnalysisService';

const sanitizeFirestoreData = (value: unknown): any => {
  if (Array.isArray(value)) {
    return value.map((item) => (item === undefined ? null : sanitizeFirestoreData(item)));
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, sanitizeFirestoreData(item)])
    );
  }
  return value;
};

export class FirestoreRealtimeService {
  private async ensureAuthenticated(): Promise<string> {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    if (auth.currentUser) return auth.currentUser.uid;

    const credential = await signInAnonymously(auth);
    return credential.user.uid;
  }

  // 1. Create Room (Teacher) - Uses writeBatch for cost optimization
  public async createRoom(params: CreateRoomParams): Promise<MockRoomData> {
    if (!db) throw new Error('Firestore is not initialized');
    if (params.questions.length === 0) {
      throw new Error('Bộ câu hỏi chưa có câu hỏi nào. Hãy thêm câu hỏi trước khi tạo phòng Live.');
    }

    const roomRef = doc(collection(db!, 'rooms'));
    const roomId = roomRef.id;
    const roomCode = String(Math.floor(100000 + Math.random() * 900000));
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 12 * 3600 * 1000).toISOString();

    const batch = writeBatch(db!);

    // Write Room Metadata
    const roomData: any = {
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
      createdAt: serverTimestamp(),
      expiresAt,
      rosterCount: params.roster.length,
      participantCount: 0,
      rosterPreview: params.roster.map((student) => ({
        id: student.id,
        studentId: student.id,
        name: student.name,
      })),
    };
    batch.set(roomRef, roomData);

    // Copy Roster into rooms/{roomId}/roster subcollection via batch
    params.roster.forEach((student) => {
      const rosterRef = doc(db!, 'rooms', roomId, 'roster', student.id);
      batch.set(rosterRef, {
        id: student.id,
        studentId: student.id,
        name: student.name,
      });
    });

    // Write initial public live questions (READY)
    params.questions.forEach((q) => {
      const qRef = doc(db!, 'rooms', roomId, 'liveQuestions', q.id);
      const publicQ: LiveQuestionPublic = {
        id: q.id,
        type: q.type,
        content: q.content,
        ...(q.options ? { options: [...q.options] } : {}),
        status: 'READY',
      };
      batch.set(qRef, sanitizeFirestoreData(publicQ));
    });

    await batch.commit();

    return {
      ...roomData,
      createdAt: now,
      roster: params.roster.map((s) => ({ id: s.id, studentId: s.id, name: s.name })),
      participants: {},
      liveQuestions: {},
      submissions: {},
    };
  }

  // 2. Join Room by Code (Student)
  // Authenticate anonymously first so Firestore Rules allow room reads.
  // Query only by roomCode to avoid requiring a composite index.
  public async joinRoomByCode(code: string): Promise<{ room: MockRoomData | null; error?: string }> {
    if (!db) throw new Error('Firestore is not initialized');

    await this.ensureAuthenticated();

    const q = query(
      collection(db, 'rooms'),
      where('roomCode', '==', code),
      limit(1)
    );

    const snap = await getDocs(q);
    if (snap.empty) {
      return { room: null, error: 'Không tìm thấy phòng học. Hãy kiểm tra lại mã.' };
    }

    const docSnap = snap.docs[0];
    const roomData = docSnap.data() as MockRoomData & {
      rosterPreview?: MockRoomData['roster'];
    };

    if (roomData.status !== 'WAITING' && roomData.status !== 'ACTIVE') {
      return { room: null, error: 'Phòng học đã kết thúc hoặc không còn hoạt động.' };
    }

    if (roomData.expiresAt && new Date(roomData.expiresAt).getTime() < Date.now()) {
      return { room: null, error: 'Phòng học đã hết hạn.' };
    }

    let roster = roomData.rosterPreview || [];

    // Compatibility for rooms created before rosterPreview was introduced.
    if (roster.length === 0) {
      const rosterSnap = await getDocs(collection(db, 'rooms', docSnap.id, 'roster'));
      roster = rosterSnap.docs.map(
        (d) => d.data() as MockRoomData['roster'][number]
      );
    }

    return {
      room: {
        ...roomData,
        id: docSnap.id,
        roster,
        participants: {},
        liveQuestions: {},
        submissions: {},
        scores: {},
      },
    };
  }

  // 3. Register Participant (Student)
  public async joinParticipant(
    roomId: string,
    studentId: string,
    name: string,
    authUid: string
  ): Promise<{ participant: MockParticipant | null; error?: string }> {
    if (!db) throw new Error('Firestore is not initialized');

    const realAuthUid = await this.ensureAuthenticated();
    const rosterRef = doc(db, 'rooms', roomId, 'roster', studentId);
    const rosterSnap = await getDoc(rosterRef);

    if (!rosterSnap.exists()) {
      return {
        participant: null,
        error: 'Học sinh này không có trong danh sách của lớp đang học.',
      };
    }

    const rosterData = rosterSnap.data() as {
      id?: string;
      studentId?: string;
      name?: string;
      studentName?: string;
    };
    const canonicalName = rosterData.name || rosterData.studentName || name;

    const participantRef = doc(db, 'rooms', roomId, 'participants', studentId);
    const roomRef = doc(db, 'rooms', roomId);
    const now = new Date().toISOString();

    let participantData: any = null;

    await runTransaction(db, async (transaction) => {
      const [participantSnap, roomSnap] = await Promise.all([
        transaction.get(participantRef),
        transaction.get(roomRef),
      ]);

      if (!roomSnap.exists()) {
        throw new Error('Phòng học không còn tồn tại.');
      }

      if (
        participantSnap.exists() &&
        participantSnap.data()?.mockAuthUid &&
        participantSnap.data()?.mockAuthUid !== realAuthUid
      ) {
        throw new Error('Tên học sinh này đang được sử dụng trên một thiết bị khác.');
      }

      participantData = {
        studentId,
        name: canonicalName,
        mockAuthUid: realAuthUid || authUid,
        sessionToken:
          participantSnap.data()?.sessionToken || `token-${Date.now()}`,
        joinedAt:
          participantSnap.exists()
            ? participantSnap.data()?.joinedAt || serverTimestamp()
            : serverTimestamp(),
        lastSeenAt: serverTimestamp(),
      };

      transaction.set(participantRef, participantData, { merge: true });

      if (!participantSnap.exists()) {
        const roomData = roomSnap.data() as { participantCount?: number };
        transaction.update(roomRef, {
          participantCount: (roomData.participantCount || 0) + 1,
          lastParticipantId: studentId,
        });
      }
    });

    return {
      participant: {
        ...participantData,
        joinedAt: now,
        lastSeenAt: now,
      },
    };
  }

  // 4. Start Room Session (Teacher)
  public async startRoomSession(roomId: string): Promise<boolean> {
    if (!db) return false;
    const roomRef = doc(db!, 'rooms', roomId);
    await updateDoc(roomRef, { status: 'ACTIVE' });
    return true;
  }

  // 5. Open Question (Teacher: Privacy Isolated)
  public async openQuestion(roomId: string, questionId: string): Promise<boolean> {
    if (!db) return false;

    const qRef = doc(db!, 'rooms', roomId, 'liveQuestions', questionId);
    const roomRef = doc(db!, 'rooms', roomId);

    const batch = writeBatch(db!);
    batch.update(qRef, {
      status: 'OPEN',
      startedAt: serverTimestamp(),
    });
    batch.update(roomRef, {
      activeQuestionId: questionId,
      status: 'ACTIVE',
    });

    await batch.commit();
    return true;
  }

  // 6. Close Question (Teacher)
  public async closeQuestion(roomId: string, questionId: string): Promise<boolean> {
    if (!db) return false;
    const qRef = doc(db!, 'rooms', roomId, 'liveQuestions', questionId);
    await updateDoc(qRef, { status: 'CLOSED' });
    return true;
  }

  // 7. Show Question Result (Teacher: Attaches private answer at RESULT moment + Idempotent Auto-Scoring)
  public async showQuestionResult(roomId: string, questionId: string): Promise<boolean> {
    if (!db) return false;

    const roomSnap = await getDoc(doc(db!, 'rooms', roomId));
    if (!roomSnap.exists()) return false;

    const roomData = roomSnap.data();
    const quizId = roomData.quizId;

    // Fetch private answer from quizzes/{quizId}/questions/{questionId}.
    // Never invent a fallback answer because that would score students incorrectly.
    const privateSnap = await getDoc(doc(db!, 'quizzes', quizId, 'questions', questionId));
    if (!privateSnap.exists() || !privateSnap.data()?.correctAnswer) {
      throw new Error('Không tìm thấy đáp án gốc của câu hỏi. Không thể công bố kết quả.');
    }

    const privateData = privateSnap.data();
    const correctAnswer = String(privateData.correctAnswer);
    const explanation = privateData.explanation ? String(privateData.explanation) : '';

    const answersMatch = (answer: string, expected: string): boolean => {
      if (privateData.type !== 'SHORT_ANSWER') {
        return answer.trim().toLowerCase() === expected.trim().toLowerCase();
      }

      let actual = answer;
      let target = expected;

      if (privateData.trimWhitespace !== false) {
        actual = actual.trim();
        target = target.trim();
      }

      if (privateData.caseInsensitive !== false) {
        actual = actual.toLocaleLowerCase('vi-VN');
        target = target.toLocaleLowerCase('vi-VN');
      }

      return actual === target;
    };

    const qRef = doc(db!, 'rooms', roomId, 'liveQuestions', questionId);
    await updateDoc(
      qRef,
      sanitizeFirestoreData({
        status: 'RESULT',
        correctAnswer,
        ...(explanation ? { explanation } : {}),
      })
    );

    // Idempotent auto-scoring optimized for a whole class:
    // read only this question's submissions/events, then commit all score updates in one batch.
    const [submissionSnap, scoredEventSnap] = await Promise.all([
      getDocs(
        query(
          collection(db!, 'rooms', roomId, 'submissions'),
          where('questionId', '==', questionId)
        )
      ),
      getDocs(
        query(
          collection(db!, 'rooms', roomId, 'scoreEvents'),
          where('questionId', '==', questionId)
        )
      ),
    ]);

    const existingEventIds = new Set(scoredEventSnap.docs.map((eventDoc) => eventDoc.id));
    const scoreBatch = writeBatch(db!);
    let pendingWrites = 0;

    submissionSnap.docs.forEach((submissionDoc) => {
      const sub = submissionDoc.data();
      if (
        typeof sub.answer !== 'string' ||
        !answersMatch(sub.answer, correctAnswer)
      ) {
        return;
      }

      const eventId = `question_${questionId}_student_${sub.studentId}`;
      if (existingEventIds.has(eventId)) return;

      scoreBatch.set(doc(db!, 'rooms', roomId, 'scoreEvents', eventId), {
        id: eventId,
        studentId: sub.studentId,
        type: 'QUESTION_CORRECT',
        points: 10,
        questionId,
        createdAt: serverTimestamp(),
      });

      scoreBatch.set(
        doc(db!, 'rooms', roomId, 'scores', sub.studentId),
        {
          studentId: sub.studentId,
          studentName: sub.studentName,
          score: increment(10),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      pendingWrites += 2;
    });

    if (pendingWrites > 0) {
      await scoreBatch.commit();
    }

    return true;
  }

  // 7b. Add Manual Score (Teacher)
  public async addManualScore(
    roomId: string,
    studentId: string,
    studentName: string,
    points: number,
    reason?: string
  ): Promise<boolean> {
    if (!db) return false;

    const eventId = `manual_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const eventRef = doc(db!, 'rooms', roomId, 'scoreEvents', eventId);
    const scoreRef = doc(db!, 'rooms', roomId, 'scores', studentId);

    const scoreSnap = await getDoc(scoreRef);
    const currentScore = scoreSnap.exists() ? scoreSnap.data()?.score || 0 : 0;
    const newScore = Math.max(0, currentScore + points);

    const batch = writeBatch(db!);
    batch.set(eventRef, {
      id: eventId,
      studentId,
      type: 'MANUAL',
      points,
      reason: reason || null,
      createdAt: serverTimestamp(),
      createdBy: 'teacher',
    });

    batch.set(scoreRef, {
      studentId,
      studentName,
      score: newScore,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    await batch.commit();
    return true;
  }

  // 7c. Call Student (Teacher)
  public async callStudent(roomId: string, studentId: string, studentName: string, reason?: string): Promise<boolean> {
    if (!db) return false;

    const roomRef = doc(db!, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return false;

    const currentData = roomSnap.data();
    const history: string[] = currentData.callHistory || [];
    if (!history.includes(studentId)) {
      history.push(studentId);
    }

    const nextSeq = (currentData.calledStudent?.callSequence || 0) + 1;

    await updateDoc(roomRef, {
      calledStudent: {
        studentId,
        studentName,
        calledAt: new Date().toISOString(),
        reason: reason || null,
        callSequence: nextSeq,
      },
      callHistory: history,
    });

    return true;
  }

  // 7d. Clear Called Student
  public async clearCalledStudent(roomId: string): Promise<boolean> {
    if (!db) return false;
    await updateDoc(doc(db!, 'rooms', roomId), { calledStudent: null });
    return true;
  }

  // 7e. Reset Call History
  public async resetCallHistory(roomId: string): Promise<boolean> {
    if (!db) return false;
    await updateDoc(doc(db!, 'rooms', roomId), { callHistory: [] });
    return true;
  }

  // 8. Submit Answer (Student) - Idempotent Key & Race Condition Enforcement
  public async submitAnswer(params: SubmitAnswerParams): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: 'Firestore is not initialized' };

    const realAuthUid = await this.ensureAuthenticated();
    const submissionId = `${params.questionId}_${params.studentId}`;
    const subRef = doc(db!, 'rooms', params.roomId, 'submissions', submissionId);

    const participantSnap = await getDoc(
      doc(db!, 'rooms', params.roomId, 'participants', params.studentId)
    );
    if (
      !participantSnap.exists() ||
      participantSnap.data()?.mockAuthUid !== realAuthUid
    ) {
      return {
        success: false,
        error: 'Phiên học sinh không hợp lệ. Hãy vào lại phòng và chọn đúng tên.',
      };
    }

    const existingSubmission = await getDoc(subRef);
    if (existingSubmission.exists()) {
      return {
        success: false,
        error: 'Em đã gửi câu trả lời cho câu này rồi.',
      };
    }

    // Race Condition Check: Ensure question is OPEN
    const liveQSnap = await getDoc(doc(db!, 'rooms', params.roomId, 'liveQuestions', params.questionId));
    if (!liveQSnap.exists() || liveQSnap.data()?.status !== 'OPEN') {
      return { success: false, error: 'Câu hỏi đã đóng nhận câu trả lời.' };
    }

    const submissionData = {
      questionId: params.questionId,
      studentId: params.studentId,
      studentName: participantSnap.data()?.name || params.studentName,
      authUid: realAuthUid || params.mockAuthUid,
      answer: params.answer.trim(),
      submittedAt: serverTimestamp(),
    };

    await setDoc(subRef, submissionData);

    return { success: true };
  }

  // 10. Finish Room (Teacher)
  public async finishRoom(roomId: string): Promise<boolean> {
    if (!db) return false;

    const firestore = db;
    const roomRef = doc(firestore, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) {
      throw new Error('Không tìm thấy phòng học.');
    }

    const rawRoomData = roomSnap.data() as MockRoomData & { createdAt?: any };
    if (rawRoomData.status === 'FINISHED' && rawRoomData.finishedAt) {
      return true;
    }

    const finishedAt = new Date().toISOString();
    const [
      rosterSnap,
      participantsSnap,
      questionsSnap,
      submissionsSnap,
      scoresSnap,
    ] = await Promise.all([
      getDocs(collection(firestore, 'rooms', roomId, 'roster')),
      getDocs(collection(firestore, 'rooms', roomId, 'participants')),
      getDocs(collection(firestore, 'rooms', roomId, 'liveQuestions')),
      getDocs(collection(firestore, 'rooms', roomId, 'submissions')),
      getDocs(collection(firestore, 'rooms', roomId, 'scores')),
    ]);

    const roster = rosterSnap.docs.map((d) => d.data() as MockRoomData['roster'][number]);
    const participants: MockRoomData['participants'] = {};
    participantsSnap.docs.forEach((d) => {
      participants[d.id] = d.data() as MockParticipant;
    });

    const liveQuestions: MockRoomData['liveQuestions'] = {};
    questionsSnap.docs.forEach((d) => {
      liveQuestions[d.id] = d.data() as LiveQuestionPublic;
    });

    const submissions: MockRoomData['submissions'] = {};
    submissionsSnap.docs.forEach((d) => {
      submissions[d.id] = d.data() as MockSubmission;
    });

    const scores: MockRoomData['scores'] = {};
    scoresSnap.docs.forEach((d) => {
      scores[d.id] = d.data() as MockRoomData['scores'][string];
    });

    const privateQuestions: Record<string, { correctAnswer: string; explanation?: string }> = {};
    if (rawRoomData.quizId) {
      const privateSnap = await getDocs(collection(firestore, 'quizzes', rawRoomData.quizId, 'questions'));
      privateSnap.docs.forEach((d) => {
        const data = d.data() as { correctAnswer?: string; explanation?: string };
        if (data.correctAnswer) {
          privateQuestions[d.id] = {
            correctAnswer: data.correctAnswer,
            ...(data.explanation ? { explanation: data.explanation } : {}),
          };
        }
      });
    }

    const rawCreatedAt = rawRoomData.createdAt;
    const createdAt =
      typeof rawCreatedAt === 'string'
        ? rawCreatedAt
        : rawCreatedAt && typeof rawCreatedAt.toDate === 'function'
          ? rawCreatedAt.toDate().toISOString()
          : finishedAt;

    const fullRoom: MockRoomData = {
      ...rawRoomData,
      id: roomId,
      createdAt,
      status: 'FINISHED',
      finishedAt,
      roster,
      participants,
      liveQuestions,
      submissions,
      scores,
      scoreEvents: rawRoomData.scoreEvents || {},
    };

    const summary = SessionAnalysisService.generateSessionSummary(fullRoom, privateQuestions);
    const batch = writeBatch(firestore);

    // Close any still-open live questions so students cannot submit after finish.
    questionsSnap.docs.forEach((questionDoc) => {
      const data = questionDoc.data() as LiveQuestionPublic;
      if (data.status === 'OPEN') {
        batch.update(questionDoc.ref, { status: 'CLOSED' });
      }
    });

    batch.update(roomRef, {
      status: 'FINISHED',
      finishedAt,
      activeGameId: null,
      activeGame: null,
      calledStudent: null,
      summaryReady: true,
      archived: rawRoomData.archived || false,
    });
    batch.set(doc(firestore, 'rooms', roomId, 'summary', 'main'), summary, { merge: true });

    await batch.commit();
    return true;
  }

  // 11. GAME CONTROL METHODS (Milestone 7)
  public async createGameSession(
    roomId: string,
    type: GameType,
    settings: GameSessionData['settings'],
    questionIds: string[]
  ): Promise<GameSessionData | null> {
    if (!db) return null;

    const pSnap = await getDocs(collection(db!, 'rooms', roomId, 'participants'));
    const participants = pSnap.docs.map((d) => d.data() as MockParticipant);

    const game = buildInitialGameSession(roomId, type, settings, questionIds, participants);

    const roomRef = doc(db!, 'rooms', roomId);
    await updateDoc(
      roomRef,
      sanitizeFirestoreData({
        activeGameId: game.id,
        activeGame: game,
      })
    );

    return game;
  }

  public async startGameSession(roomId: string): Promise<boolean> {
    if (!db) return false;

    const roomRef = doc(db!, 'rooms', roomId);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return false;

    const roomData = snap.data() as MockRoomData;
    if (!roomData.activeGame) return false;

    const updatedGame: GameSessionData = {
      ...roomData.activeGame,
      status: 'RUNNING',
      startedAt: new Date().toISOString(),
      roundStartedAt: new Date().toISOString(),
    };

    await updateDoc(roomRef, { activeGame: sanitizeFirestoreData(updatedGame) });
    return true;
  }

  public async pauseGameSession(roomId: string): Promise<boolean> {
    if (!db) return false;

    const roomRef = doc(db!, 'rooms', roomId);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return false;

    const roomData = snap.data() as MockRoomData;
    if (!roomData.activeGame) return false;

    const updatedGame: GameSessionData = {
      ...roomData.activeGame,
      status: roomData.activeGame.status === 'PAUSED' ? 'RUNNING' : 'PAUSED',
    };

    await updateDoc(roomRef, { activeGame: sanitizeFirestoreData(updatedGame) });
    return true;
  }

  public async finishGameSession(roomId: string): Promise<boolean> {
    if (!db) return false;

    const roomRef = doc(db!, 'rooms', roomId);
    await updateDoc(roomRef, {
      activeGameId: null,
      activeGame: null,
    });
    return true;
  }

  public async updateGamePayload(roomId: string, updateFn: (game: GameSessionData) => GameSessionData): Promise<boolean> {
    if (!db) return false;

    const roomRef = doc(db!, 'rooms', roomId);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return false;

    const roomData = snap.data() as MockRoomData;
    if (!roomData.activeGame) return false;

    const updatedGame = updateFn({ ...roomData.activeGame });
    await updateDoc(roomRef, { activeGame: sanitizeFirestoreData(updatedGame) });
    return true;
  }

  // --- LISTENERS ---
  // Keep room metadata and the live subcollections in sync.
  public subscribeRoom(roomId: string, callback: (room: MockRoomData) => void): () => void {
    if (!db) return () => {};

    const firestore = db;
    let roomMeta: MockRoomData | null = null;
    let roster: MockRoomData['roster'] = [];
    let participants: MockRoomData['participants'] = {};
    let liveQuestions: MockRoomData['liveQuestions'] = {};
    let submissions: MockRoomData['submissions'] = {};
    let scores: MockRoomData['scores'] = {};
    let scoreEvents: Record<string, ScoreEvent> = {};

    const emit = () => {
      if (!roomMeta) return;
      callback({
        ...roomMeta,
        id: roomId,
        roster,
        participants,
        liveQuestions,
        submissions,
        scores,
        scoreEvents,
        calledStudent: roomMeta.calledStudent || null,
        callHistory: roomMeta.callHistory || [],
        activeGameId: roomMeta.activeGameId || null,
        activeGame: roomMeta.activeGame || null,
      });
    };

    const unsubscribers = [
      onSnapshot(doc(firestore, 'rooms', roomId), (snap) => {
        if (!snap.exists()) return;
        roomMeta = { ...(snap.data() as MockRoomData), id: snap.id };
        emit();
      }),
      onSnapshot(collection(firestore, 'rooms', roomId, 'roster'), (snap) => {
        roster = snap.docs.map((d) => d.data() as MockRoomData['roster'][number]);
        emit();
      }),
      onSnapshot(collection(firestore, 'rooms', roomId, 'participants'), (snap) => {
        const next: MockRoomData['participants'] = {};
        snap.docs.forEach((d) => {
          next[d.id] = d.data() as MockParticipant;
        });
        participants = next;
        emit();
      }),
      onSnapshot(collection(firestore, 'rooms', roomId, 'liveQuestions'), (snap) => {
        const next: MockRoomData['liveQuestions'] = {};
        snap.docs.forEach((d) => {
          next[d.id] = d.data() as LiveQuestionPublic;
        });
        liveQuestions = next;
        emit();
      }),
      onSnapshot(
        auth?.currentUser?.isAnonymous
          ? query(
              collection(firestore, 'rooms', roomId, 'submissions'),
              where('authUid', '==', auth.currentUser.uid)
            )
          : collection(firestore, 'rooms', roomId, 'submissions'),
        (snap) => {
          const next: MockRoomData['submissions'] = {};
          snap.docs.forEach((d) => {
            next[d.id] = d.data() as MockSubmission;
          });
          submissions = next;
          emit();
        }
      ),
      onSnapshot(collection(firestore, 'rooms', roomId, 'scores'), (snap) => {
        const next: MockRoomData['scores'] = {};
        snap.docs.forEach((d) => {
          next[d.id] = d.data() as MockRoomData['scores'][string];
        });
        scores = next;
        emit();
      }),
      ...(auth?.currentUser?.isAnonymous
        ? []
        : [
            onSnapshot(collection(firestore, 'rooms', roomId, 'scoreEvents'), (snap) => {
              const next: Record<string, ScoreEvent> = {};
              snap.docs.forEach((d) => {
                next[d.id] = d.data() as ScoreEvent;
              });
              scoreEvents = next;
              emit();
            }),
          ]),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }

  public subscribeStudentRoom(
    roomId: string,
    studentId: string,
    callback: (room: MockRoomData) => void
  ): () => void {
    if (!db) return () => {};

    const firestore = db;
    const authUid = auth?.currentUser?.uid || '';

    let roomMeta: MockRoomData | null = null;
    let activeQuestionId: string | null = null;
    let liveQuestion: LiveQuestionPublic | null = null;
    let submissions: MockRoomData['submissions'] = {};
    let score: MockRoomData['scores'][string] | null = null;

    let unsubscribeQuestion: (() => void) | null = null;

    const emit = () => {
      if (!roomMeta) return;

      const liveQuestions =
        activeQuestionId && liveQuestion
          ? { [activeQuestionId]: liveQuestion }
          : {};

      callback({
        ...roomMeta,
        id: roomId,
        roster: [],
        participants: {},
        liveQuestions,
        submissions,
        scores: score ? { [studentId]: score } : {},
        scoreEvents: {},
        calledStudent: roomMeta.calledStudent || null,
        callHistory: [],
        activeGameId: roomMeta.activeGameId || null,
        activeGame: roomMeta.activeGame || null,
      });
    };

    const bindActiveQuestion = (questionId: string | null) => {
      if (questionId === activeQuestionId && unsubscribeQuestion) return;

      if (unsubscribeQuestion) {
        unsubscribeQuestion();
        unsubscribeQuestion = null;
      }

      activeQuestionId = questionId;
      liveQuestion = null;

      if (!questionId) {
        emit();
        return;
      }

      unsubscribeQuestion = onSnapshot(
        doc(firestore, 'rooms', roomId, 'liveQuestions', questionId),
        (snap) => {
          liveQuestion = snap.exists()
            ? ({ id: snap.id, ...(snap.data() as Omit<LiveQuestionPublic, 'id'>) } as LiveQuestionPublic)
            : null;
          emit();
        }
      );
    };

    const unsubscribeRoom = onSnapshot(doc(firestore, 'rooms', roomId), (snap) => {
      if (!snap.exists()) return;

      roomMeta = { ...(snap.data() as MockRoomData), id: snap.id };
      const nextQuestionId = roomMeta.activeQuestionId || null;

      if (nextQuestionId !== activeQuestionId) {
        bindActiveQuestion(nextQuestionId);
      }

      emit();
    });

    const unsubscribeSubmissions = authUid
      ? onSnapshot(
          query(
            collection(firestore, 'rooms', roomId, 'submissions'),
            where('authUid', '==', authUid)
          ),
          (snap) => {
            const next: MockRoomData['submissions'] = {};
            snap.docs.forEach((submissionDoc) => {
              next[submissionDoc.id] = {
                id: submissionDoc.id,
                ...(submissionDoc.data() as Omit<MockSubmission, 'id'>),
              };
            });
            submissions = next;
            emit();
          }
        )
      : () => {};

    const unsubscribeScore = onSnapshot(
      doc(firestore, 'rooms', roomId, 'scores', studentId),
      (snap) => {
        score = snap.exists()
          ? (snap.data() as MockRoomData['scores'][string])
          : null;
        emit();
      }
    );

    return () => {
      unsubscribeRoom();
      unsubscribeSubmissions();
      unsubscribeScore();
      if (unsubscribeQuestion) unsubscribeQuestion();
    };
  }

}

export const firestoreRealtimeService = new FirestoreRealtimeService();
