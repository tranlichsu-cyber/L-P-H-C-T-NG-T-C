import { realtimeService, MockRealtimeService } from './MockRealtimeService';
import { firestoreRealtimeService } from '../firebase/FirestoreRealtimeService';
import { isFirebaseConfigured } from '../firebase/firebase';
import { loadMockDatabase } from './mockStorage';
import type { CardChoice } from '../qr/cards';
import type {
  CreateRoomParams,
  GameSessionData,
  GameType,
  LiveQuestionPublic,
  MockParticipant,
  MockRoomData,
  SubmitAnswerParams,
} from './types';
import {
  broadcastRoomAction,
  broadcastRoomState,
  cacheRoomLocally,
  ensureRoomPrivateQuestions,
  isFirestoreTemporarilyExhausted,
  isQuotaExceededError,
  markFirestoreQuotaExceeded,
  subscribeRelayRoom,
  type PrivateAnswerMap,
} from '../qr/cloudRoomRelay';

const dataMode = import.meta.env.VITE_DATA_MODE || 'mock';

export const isFirebaseActive = dataMode === 'firebase' && isFirebaseConfigured;

function shouldUseFirestoreForRoom(roomId?: string): boolean {
  if (!isFirebaseActive || isFirestoreTemporarilyExhausted()) return false;
  if (roomId && roomId.startsWith('room-')) return false;
  return true;
}

function normalizeQrChoice(rawAnswer: string, options?: string[]): string {
  const trimmed = String(rawAnswer || '').trim();
  if (/^[A-D]$/i.test(trimmed)) return trimmed.toUpperCase();
  if (options?.length) {
    const idx = options.findIndex(
      o => o.trim().toLocaleLowerCase('vi-VN') === trimmed.toLocaleLowerCase('vi-VN')
    );
    if (idx >= 0 && idx < 4) return String.fromCharCode(65 + idx);
  }
  return trimmed || 'A';
}

function buildQuestionMaps(params: CreateRoomParams): {
  liveQuestions: Record<string, LiveQuestionPublic>;
  privateAnswers: PrivateAnswerMap;
} {
  const liveQuestions: Record<string, LiveQuestionPublic> = {};
  const privateAnswers: PrivateAnswerMap = {};

  for (const q of params.questions) {
    privateAnswers[q.id] = {
      correctAnswer:
        params.responseMode === 'QR_CARD'
          ? normalizeQrChoice(q.correctAnswer, q.options)
          : q.correctAnswer,
      explanation: q.explanation,
      correctPoints: q.correctPoints ?? 10,
      wrongPenalty: q.wrongPenalty ?? (params.responseMode === 'QR_CARD' ? 0 : 5),
    };

    liveQuestions[q.id] = {
      id: q.id,
      type: q.type,
      content: q.content,
      ...(q.options ? { options: [...q.options] } : {}),
      ...(q.media ? { media: structuredClone(q.media) } : {}),
      status: 'READY',
    };
  }

  return { liveQuestions, privateAnswers };
}

class HybridRealtimeService {
  public async createRoom(params: CreateRoomParams): Promise<MockRoomData> {
    const { liveQuestions, privateAnswers } = buildQuestionMaps(params);
    const rosterItems = params.roster.map(r => ({
      id: r.id,
      studentId: r.id,
      name: r.name,
    }));

    if (shouldUseFirestoreForRoom()) {
      try {
        const fsRoom = await firestoreRealtimeService.createRoom(params);
        const enriched: MockRoomData = {
          ...fsRoom,
          roster: rosterItems,
          liveQuestions,
          participants: fsRoom.participants || {},
          submissions: fsRoom.submissions || {},
          scores: fsRoom.scores || {},
          scoreEvents: fsRoom.scoreEvents || {},
        };
        const saved = cacheRoomLocally(enriched, privateAnswers);
        void broadcastRoomState(saved.id);
        return saved;
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
          console.warn(
            '[HybridRealtimeService] Firestore quota exceeded khi tạo phòng — tự động chuyển sang Direct Relay.'
          );
        } else {
          throw err;
        }
      }
    }

    const localRoom = realtimeService.createRoom(params);
    const saved = cacheRoomLocally(localRoom, privateAnswers);
    void broadcastRoomState(saved.id);
    return saved;
  }

  public async joinRoomByCode(
    code: string
  ): Promise<{ room: MockRoomData | null; error?: string }> {
    if (shouldUseFirestoreForRoom()) {
      try {
        return await firestoreRealtimeService.joinRoomByCode(code);
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        } else {
          throw err;
        }
      }
    }
    return realtimeService.joinRoomByCode(code);
  }

  public async joinParticipant(
    roomId: string,
    studentId: string,
    name: string,
    authUid: string
  ): Promise<{ participant: MockParticipant | null; error?: string }> {
    if (shouldUseFirestoreForRoom(roomId)) {
      try {
        return await firestoreRealtimeService.joinParticipant(roomId, studentId, name, authUid);
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        } else {
          throw err;
        }
      }
    }
    const res = realtimeService.joinParticipant(roomId, studentId, name, authUid);
    if (res.participant) void broadcastRoomState(roomId);
    return res;
  }

  public async startRoomSession(roomId: string): Promise<boolean> {
    if (shouldUseFirestoreForRoom(roomId)) {
      try {
        const ok = await firestoreRealtimeService.startRoomSession(roomId);
        if (ok) {
          realtimeService.startRoomSession(roomId);
          void broadcastRoomState(roomId);
          return true;
        }
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        } else {
          throw err;
        }
      }
    }
    const ok = realtimeService.startRoomSession(roomId);
    if (ok) void broadcastRoomState(roomId);
    return ok;
  }

  public async openQuestion(roomId: string, questionId: string): Promise<boolean> {
    if (shouldUseFirestoreForRoom(roomId)) {
      try {
        const ok = await firestoreRealtimeService.openQuestion(roomId, questionId);
        if (ok) {
          realtimeService.openQuestion(roomId, questionId);
          void broadcastRoomAction(roomId, { kind: 'OPEN_QUESTION', questionId });
          return true;
        }
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        } else {
          throw err;
        }
      }
    }

    const ok = realtimeService.openQuestion(roomId, questionId);
    if (ok) {
      void broadcastRoomAction(roomId, { kind: 'OPEN_QUESTION', questionId });
    }
    return ok;
  }

  public async closeQuestion(roomId: string, questionId: string): Promise<boolean> {
    if (shouldUseFirestoreForRoom(roomId)) {
      try {
        const ok = await firestoreRealtimeService.closeQuestion(roomId, questionId);
        if (ok) {
          realtimeService.closeQuestion(roomId, questionId);
          void broadcastRoomAction(roomId, { kind: 'CLOSE_QUESTION', questionId });
          return true;
        }
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        } else {
          throw err;
        }
      }
    }

    const ok = realtimeService.closeQuestion(roomId, questionId);
    if (ok) {
      void broadcastRoomAction(roomId, { kind: 'CLOSE_QUESTION', questionId });
    }
    return ok;
  }

  public async showQuestionResult(roomId: string, questionId: string): Promise<boolean> {
    ensureRoomPrivateQuestions(roomId);

    if (shouldUseFirestoreForRoom(roomId)) {
      try {
        const ok = await firestoreRealtimeService.showQuestionResult(roomId, questionId);
        if (ok) {
          realtimeService.showQuestionResult(roomId, questionId);
          void broadcastRoomAction(roomId, { kind: 'SHOW_RESULT', questionId });
          return true;
        }
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        } else {
          // If Firestore failed for another reason, fall back if we have the room locally
          if (!loadMockDatabase().rooms[roomId]) throw err;
        }
      }
    }

    ensureRoomPrivateQuestions(roomId);
    const ok = realtimeService.showQuestionResult(roomId, questionId);
    if (ok) {
      void broadcastRoomAction(roomId, { kind: 'SHOW_RESULT', questionId });
    }
    return ok;
  }

  public async submitQrAnswer(
    roomId: string,
    questionId: string,
    studentId: string,
    choice: CardChoice
  ): Promise<{ success: boolean; error?: string }> {
    if (shouldUseFirestoreForRoom(roomId)) {
      try {
        const res = await firestoreRealtimeService.submitQrAnswer(
          roomId,
          questionId,
          studentId,
          choice
        );
        if (res.success) {
          realtimeService.submitQrAnswer(roomId, questionId, studentId, choice);
          void broadcastRoomAction(roomId, {
            kind: 'SUBMIT_QR_ANSWER',
            questionId,
            studentId,
            choice,
          });
          return res;
        }
        // If Firestore rejected only because of missing state that exists locally, fall through
        if (res.error && !loadMockDatabase().rooms[roomId]) return res;
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        } else if (!loadMockDatabase().rooms[roomId]) {
          throw err;
        }
      }
    }

    const res = realtimeService.submitQrAnswer(roomId, questionId, studentId, choice);
    if (res.success) {
      void broadcastRoomAction(roomId, {
        kind: 'SUBMIT_QR_ANSWER',
        questionId,
        studentId,
        choice,
      });
    }
    return res;
  }

  public async submitAnswer(
    params: SubmitAnswerParams
  ): Promise<{ success: boolean; error?: string }> {
    if (shouldUseFirestoreForRoom(params.roomId)) {
      try {
        return await firestoreRealtimeService.submitAnswer(params);
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        } else {
          throw err;
        }
      }
    }
    const res = realtimeService.submitAnswer(params);
    if (res.success) void broadcastRoomState(params.roomId);
    return res;
  }

  public async addManualScore(
    roomId: string,
    studentId: string,
    studentName: string,
    points: number,
    reason?: string,
    awardKey?: string
  ): Promise<boolean> {
    if (shouldUseFirestoreForRoom(roomId)) {
      try {
        const ok = await firestoreRealtimeService.addManualScore(
          roomId,
          studentId,
          studentName,
          points,
          reason,
          awardKey
        );
        if (ok) {
          realtimeService.addManualScore(roomId, studentId, studentName, points, reason, awardKey);
          void broadcastRoomState(roomId);
          return true;
        }
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        } else {
          throw err;
        }
      }
    }
    const ok = realtimeService.addManualScore(
      roomId,
      studentId,
      studentName,
      points,
      reason,
      awardKey
    );
    if (ok) void broadcastRoomState(roomId);
    return ok;
  }

  public async callStudent(
    roomId: string,
    studentId: string,
    studentName: string,
    reason?: string
  ): Promise<boolean> {
    if (shouldUseFirestoreForRoom(roomId)) {
      try {
        const ok = await firestoreRealtimeService.callStudent(
          roomId,
          studentId,
          studentName,
          reason
        );
        if (ok) {
          realtimeService.callStudent(roomId, studentId, studentName, reason);
          void broadcastRoomState(roomId);
          return true;
        }
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        } else {
          throw err;
        }
      }
    }
    const ok = realtimeService.callStudent(roomId, studentId, studentName, reason);
    if (ok) void broadcastRoomState(roomId);
    return ok;
  }

  public async clearCalledStudent(roomId: string): Promise<boolean> {
    if (shouldUseFirestoreForRoom(roomId)) {
      try {
        const ok = await firestoreRealtimeService.clearCalledStudent(roomId);
        if (ok) {
          realtimeService.clearCalledStudent(roomId);
          void broadcastRoomState(roomId);
          return true;
        }
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        } else {
          throw err;
        }
      }
    }
    const ok = realtimeService.clearCalledStudent(roomId);
    if (ok) void broadcastRoomState(roomId);
    return ok;
  }

  public async resetCallHistory(roomId: string): Promise<boolean> {
    if (shouldUseFirestoreForRoom(roomId)) {
      try {
        const ok = await firestoreRealtimeService.resetCallHistory(roomId);
        if (ok) {
          realtimeService.resetCallHistory(roomId);
          void broadcastRoomState(roomId);
          return true;
        }
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        } else {
          throw err;
        }
      }
    }
    const ok = realtimeService.resetCallHistory(roomId);
    if (ok) void broadcastRoomState(roomId);
    return ok;
  }

  public async finishRoom(roomId: string): Promise<boolean> {
    realtimeService.finishRoom(roomId);
    void broadcastRoomAction(roomId, { kind: 'FINISH_ROOM' });

    if (shouldUseFirestoreForRoom(roomId)) {
      try {
        await firestoreRealtimeService.finishRoom(roomId);
        return true;
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
          return true;
        }
        return true;
      }
    }
    return true;
  }

  public async createGameSession(
    roomId: string,
    type: GameType,
    settings: GameSessionData['settings'],
    questionIds: string[]
  ): Promise<GameSessionData | null> {
    if (shouldUseFirestoreForRoom(roomId)) {
      try {
        return await firestoreRealtimeService.createGameSession(
          roomId,
          type,
          settings,
          questionIds
        );
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        } else {
          throw err;
        }
      }
    }
    const game = realtimeService.createGameSession(roomId, type, settings, questionIds);
    if (game) void broadcastRoomState(roomId);
    return game;
  }

  public async startGameSession(roomId: string): Promise<boolean> {
    if (shouldUseFirestoreForRoom(roomId)) {
      try {
        return await firestoreRealtimeService.startGameSession(roomId);
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        } else {
          throw err;
        }
      }
    }
    const ok = realtimeService.startGameSession(roomId);
    if (ok) void broadcastRoomState(roomId);
    return ok;
  }

  public async pauseGameSession(roomId: string): Promise<boolean> {
    if (shouldUseFirestoreForRoom(roomId)) {
      try {
        return await firestoreRealtimeService.pauseGameSession(roomId);
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        } else {
          throw err;
        }
      }
    }
    const ok = realtimeService.pauseGameSession(roomId);
    if (ok) void broadcastRoomState(roomId);
    return ok;
  }

  public async finishGameSession(roomId: string): Promise<boolean> {
    if (shouldUseFirestoreForRoom(roomId)) {
      try {
        return await firestoreRealtimeService.finishGameSession(roomId);
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        } else {
          throw err;
        }
      }
    }
    const ok = realtimeService.finishGameSession(roomId);
    if (ok) void broadcastRoomState(roomId);
    return ok;
  }

  public async updateGamePayload(
    roomId: string,
    updateFn: (game: GameSessionData) => GameSessionData
  ): Promise<boolean> {
    if (shouldUseFirestoreForRoom(roomId)) {
      try {
        return await firestoreRealtimeService.updateGamePayload(roomId, updateFn);
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        } else {
          throw err;
        }
      }
    }
    const ok = realtimeService.updateGamePayload(roomId, updateFn);
    if (ok) void broadcastRoomState(roomId);
    return ok;
  }

  public subscribeRoom(roomId: string, callback: (room: MockRoomData) => void): () => void {
    const unsubRelay = subscribeRelayRoom(roomId, relayRoom => {
      callback(relayRoom);
    });

    let unsubFirestore: (() => void) | null = null;
    if (shouldUseFirestoreForRoom(roomId)) {
      try {
        unsubFirestore = firestoreRealtimeService.subscribeRoom(roomId, fsRoom => {
          const merged = cacheRoomLocally(fsRoom);
          callback(merged);
        });
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        }
      }
    }

    return () => {
      unsubRelay();
      if (unsubFirestore) unsubFirestore();
    };
  }

  public subscribeStudentRoom(
    roomId: string,
    studentId: string,
    callback: (room: MockRoomData) => void
  ): () => void {
    const unsubRelay = subscribeRelayRoom(roomId, relayRoom => {
      callback(relayRoom);
    });

    let unsubFirestore: (() => void) | null = null;
    if (shouldUseFirestoreForRoom(roomId)) {
      try {
        unsubFirestore = firestoreRealtimeService.subscribeStudentRoom(
          roomId,
          studentId,
          fsRoom => {
            callback(fsRoom);
          }
        );
      } catch (err) {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        }
      }
    }

    return () => {
      unsubRelay();
      if (unsubFirestore) unsubFirestore();
    };
  }
}

const hybridRealtimeService = new HybridRealtimeService();

// Export active realtime service instance
export const activeRealtimeService: MockRealtimeService = (
  isFirebaseActive ? (hybridRealtimeService as unknown as MockRealtimeService) : realtimeService
);

console.info(
  `[REALTIME SERVICE] Đang hoạt động ở chế độ: ${
    isFirebaseActive
      ? '🔥 FIREBASE FIRESTORE + CLOUD RELAY FALLBACK'
      : '📦 MOCK REALTIME (BroadcastChannel)'
  }`
);
