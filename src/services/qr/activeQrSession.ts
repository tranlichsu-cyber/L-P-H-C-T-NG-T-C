import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { isFirebaseActive } from '../realtime/realtimeServiceSwitch';
import { loadMockDatabase, saveMockDatabase, getRoomByCode } from '../realtime/mockStorage';
import { eventBus } from '../realtime/broadcastChannel';
import type { MockRoomData } from '../realtime/types';
import {
  broadcastRoomAction,
  cacheRoomLocally,
  isFirestoreTemporarilyExhausted,
  isQuotaExceededError,
  markFirestoreQuotaExceeded,
  subscribeRelayTeacherRooms,
} from './cloudRoomRelay';

const RETURN_TO_KEY = 'lhtt_return_to';
const lastFirestoreRoomsFetchAt = new Map<string, number>();

export function isAllowedTeacherReturnTo(path: unknown): path is string {
  if (typeof path !== 'string') return false;
  return (
    /^\/teacher\/room\/[^/?#]+(?:\?qr=1)?$/.test(path) ||
    /^\/teacher\/qr-cards(?:\/[^/?#]+(?:\/(?:scan|present))?)?$/.test(path)
  );
}

export function saveReturnTo(path: string): void {
  if (!isAllowedTeacherReturnTo(path)) return;
  try {
    sessionStorage.setItem(RETURN_TO_KEY, path);
  } catch {
    // Ignore storage restriction
  }
}

export function peekReturnTo(stateReturnTo?: unknown): string | null {
  if (isAllowedTeacherReturnTo(stateReturnTo)) return stateReturnTo;
  try {
    const saved = sessionStorage.getItem(RETURN_TO_KEY);
    if (isAllowedTeacherReturnTo(saved)) return saved;
  } catch {
    // Ignore storage restriction
  }
  return null;
}

export function consumeReturnTo(stateReturnTo?: unknown): string | null {
  const target = peekReturnTo(stateReturnTo);
  try {
    sessionStorage.removeItem(RETURN_TO_KEY);
  } catch {
    // Ignore storage restriction
  }
  return target;
}

function toTimestampMs(value: unknown): number {
  if (!value) return 0;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === 'object' && value !== null) {
    const maybeTs = value as { toMillis?: () => number; seconds?: number };
    if (typeof maybeTs.toMillis === 'function') return maybeTs.toMillis();
    if (typeof maybeTs.seconds === 'number') return maybeTs.seconds * 1000;
  }
  return 0;
}

function isRoomStillActive(room: Partial<MockRoomData>): boolean {
  if (!room || room.status === 'FINISHED') return false;
  if (room.expiresAt && typeof room.expiresAt === 'string') {
    const exp = Date.parse(room.expiresAt);
    if (Number.isFinite(exp) && exp < Date.now()) return false;
  }
  return true;
}

function sortActiveRooms(rooms: MockRoomData[]): MockRoomData[] {
  return [...rooms].sort((a, b) => {
    const timeDiff = toTimestampMs(b.createdAt) - toTimestampMs(a.createdAt);
    if (timeDiff !== 0) return timeDiff;
    const aQr = a.responseMode === 'QR_CARD' ? 1 : 0;
    const bQr = b.responseMode === 'QR_CARD' ? 1 : 0;
    return bQr - aQr;
  });
}

export function subscribeActiveTeacherRooms(
  teacherId: string | undefined | null,
  callback: (rooms: MockRoomData[]) => void
): () => void {
  if (!teacherId) {
    callback([]);
    return () => {};
  }

  let relayRooms: MockRoomData[] = [];
  let fsRooms: MockRoomData[] = [];

  const emitCombined = () => {
    const mergedMap = new Map<string, MockRoomData>();
    for (const r of fsRooms) {
      if (isRoomStillActive(r)) mergedMap.set(r.id, r);
    }
    for (const r of relayRooms) {
      const localRecord = loadMockDatabase().rooms?.[r.id];
      if (localRecord?.status === 'FINISHED') {
        mergedMap.delete(r.id);
        continue;
      }
      if (isRoomStillActive(r)) {
        const existing = mergedMap.get(r.id);
        mergedMap.set(r.id, existing ? { ...existing, ...r } : r);
      }
    }
    callback(sortActiveRooms([...mergedMap.values()]));
  };

  const unsubRelay = subscribeRelayTeacherRooms(teacherId, list => {
    relayRooms = list;
    emitCombined();
  });

  // Perform a lightweight, throttled one-shot query on Firestore only when quota is healthy
  const lastFetch = lastFirestoreRoomsFetchAt.get(teacherId) || 0;
  if (
    isFirebaseActive &&
    db &&
    !isFirestoreTemporarilyExhausted() &&
    Date.now() - lastFetch > 45_000
  ) {
    lastFirestoreRoomsFetchAt.set(teacherId, Date.now());
    const q = query(collection(db, 'rooms'), where('teacherId', '==', teacherId));
    void getDocs(q)
      .then(snap => {
        const list: MockRoomData[] = [];
        snap.docs.forEach(d => {
          const data = d.data() as MockRoomData;
          if (isRoomStillActive(data)) {
            const roomObj: MockRoomData = {
              ...data,
              id: d.id,
              roster: data.roster || [],
              participants: data.participants || {},
              liveQuestions: data.liveQuestions || {},
              submissions: data.submissions || {},
              scores: data.scores || {},
              scoreEvents: data.scoreEvents || {},
            };
            cacheRoomLocally(roomObj);
            list.push(roomObj);
          }
        });
        fsRooms = list;
        emitCombined();
      })
      .catch(err => {
        if (isQuotaExceededError(err)) {
          markFirestoreQuotaExceeded();
        }
      });
  }

  return () => {
    unsubRelay();
  };
}

export async function closeTeacherRoom(roomId: string): Promise<boolean> {
  if (!roomId) return false;

  const now = new Date().toISOString();
  const mockDb = loadMockDatabase();
  if (mockDb.rooms?.[roomId]) {
    mockDb.rooms[roomId].status = 'FINISHED';
    mockDb.rooms[roomId].finishedAt = now;
    saveMockDatabase(mockDb);
    eventBus.publish({
      type: 'ROOM_UPDATED',
      roomId,
      payload: mockDb.rooms[roomId],
      timestamp: now,
    });
  } else {
    // Record tombstoned room in mockStorage so Firestore cache merge knows it was closed
    mockDb.rooms[roomId] = {
      id: roomId,
      roomCode: '',
      teacherId: '',
      classId: '',
      className: '',
      subject: '',
      quizId: '',
      quizTitle: '',
      status: 'FINISHED',
      finishedAt: now,
      activeQuestionId: null,
      createdAt: now,
      expiresAt: now,
      roster: [],
      participants: {},
      liveQuestions: {},
      submissions: {},
      scores: {},
      scoreEvents: {},
    };
    saveMockDatabase(mockDb);
  }

  void broadcastRoomAction(roomId, { kind: 'FINISH_ROOM' });

  // Single lightweight status update on Firestore (1 write instead of reading 7 subcollections)
  if (
    isFirebaseActive &&
    db &&
    !isFirestoreTemporarilyExhausted() &&
    !roomId.startsWith('room-')
  ) {
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        status: 'FINISHED',
        finishedAt: now,
        activeGameId: null,
        activeGame: null,
        calledStudent: null,
      });
    } catch (err) {
      if (isQuotaExceededError(err)) {
        markFirestoreQuotaExceeded();
      }
    }
  }

  return true;
}

export async function closeMultipleTeacherRooms(roomIds: string[]): Promise<void> {
  const uniqueIds = [...new Set(roomIds.filter(Boolean))];
  if (!uniqueIds.length) return;
  await Promise.allSettled(uniqueIds.map(id => closeTeacherRoom(id)));
}

export async function lookupRoomByCodeForTeacher(
  code: string
): Promise<{ roomId: string; className: string; subject: string; responseMode?: string } | null> {
  const clean = code.trim();
  if (clean.length !== 6) return null;

  const localRoom = getRoomByCode(clean);
  if (localRoom && localRoom.status !== 'FINISHED') {
    return {
      roomId: localRoom.id,
      className: localRoom.className || 'Lớp học',
      subject: localRoom.subject || '',
      responseMode: localRoom.responseMode,
    };
  }

  if (isFirebaseActive && db && !isFirestoreTemporarilyExhausted()) {
    try {
      const snap = await getDoc(doc(db, 'roomCodes', clean));
      if (!snap.exists()) return null;
      const data = snap.data() as {
        roomId?: string;
        className?: string;
        subject?: string;
        status?: string;
        responseMode?: string;
      };
      if (!data.roomId || data.status === 'FINISHED') return null;
      return {
        roomId: data.roomId,
        className: data.className || 'Lớp học',
        subject: data.subject || '',
        responseMode: data.responseMode,
      };
    } catch (err) {
      if (isQuotaExceededError(err)) {
        markFirestoreQuotaExceeded();
      }
      return null;
    }
  }

  return null;
}
