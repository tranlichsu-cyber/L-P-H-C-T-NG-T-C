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
        options: q.options ? [...q.options] : undefined,
        status: 'READY',
      };
      batch.set(qRef, publicQ);
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
    const roomData = docSnap.data() as MockRoomData;

    if (roomData.status !== 'WAITING' && roomData.status !== 'ACTIVE') {
      return { room: null, error: 'Phòng học đã kết thúc hoặc không còn hoạt động.' };
    }

    if (roomData.expiresAt && new Date(roomData.expiresAt).getTime() < Date.now()) {
      return { room: null, error: 'Phòng học đã hết hạn.' };
    }

    const rosterSnap = await getDocs(collection(db, 'rooms', docSnap.id, 'roster'));
    const roster = rosterSnap.docs.map((d) => d.data() as MockRoomData['roster'][number]);

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
    const participantRef = doc(db, 'rooms', roomId, 'participants', studentId);
    const now = new Date().toISOString();

    const participantData = {
      studentId,
      name,
      mockAuthUid: realAuthUid || authUid,
      sessionToken: `token-${Date.now()}`,
      joinedAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
    };

    await setDoc(participantRef, participantData, { merge: true });

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

    // Fetch private answer from quizzes/{quizId}/questions/{questionId}
    const privateSnap = await getDoc(doc(db!, 'quizzes', quizId, 'questions', questionId));
    let correctAnswer = '500';
    let explanation = 'Giải thích đáp án';

    if (privateSnap.exists()) {
      const data = privateSnap.data();
      correctAnswer = data.correctAnswer || correctAnswer;
      explanation = data.explanation || explanation;
    }

    const qRef = doc(db!, 'rooms', roomId, 'liveQuestions', questionId);
    await updateDoc(qRef, {
      status: 'RESULT',
      correctAnswer,
      explanation,
    });

    // Idempotent Auto-Scoring for correct submissions in Firestore
    const sSnap = await getDocs(collection(db!, 'rooms', roomId, 'submissions'));
    const targetCorrect = correctAnswer.trim().toLowerCase();

    for (const d of sSnap.docs) {
      const sub = d.data();
      if (sub.questionId === questionId && sub.answer?.trim().toLowerCase() === targetCorrect) {
        const eventId = `question_${questionId}_student_${sub.studentId}`;
        const eventRef = doc(db!, 'rooms', roomId, 'scoreEvents', eventId);
        const eventSnap = await getDoc(eventRef);

        if (!eventSnap.exists()) {
          const batch = writeBatch(db!);
          batch.set(eventRef, {
            id: eventId,
            studentId: sub.studentId,
            type: 'QUESTION_CORRECT',
            points: 10,
            questionId,
            createdAt: serverTimestamp(),
          });

          const scoreRef = doc(db!, 'rooms', roomId, 'scores', sub.studentId);
          const scoreSnap = await getDoc(scoreRef);
          const currentScore = scoreSnap.exists() ? scoreSnap.data()?.score || 0 : 0;

          batch.set(scoreRef, {
            studentId: sub.studentId,
            studentName: sub.studentName,
            score: currentScore + 10,
            updatedAt: serverTimestamp(),
          }, { merge: true });

          await batch.commit();
        }
      }
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

    // Race Condition Check: Ensure question is OPEN
    const liveQSnap = await getDoc(doc(db!, 'rooms', params.roomId, 'liveQuestions', params.questionId));
    if (!liveQSnap.exists() || liveQSnap.data()?.status !== 'OPEN') {
      return { success: false, error: 'Câu hỏi đã đóng nhận câu trả lời.' };
    }

    const submissionData = {
      questionId: params.questionId,
      studentId: params.studentId,
      studentName: params.studentName,
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
    await updateDoc(roomRef, {
      activeGameId: game.id,
      activeGame: game,
    });

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

    await updateDoc(roomRef, { activeGame: updatedGame });
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

    await updateDoc(roomRef, { activeGame: updatedGame });
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
    await updateDoc(roomRef, { activeGame: updatedGame });
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

}

export const firestoreRealtimeService = new FirestoreRealtimeService();
