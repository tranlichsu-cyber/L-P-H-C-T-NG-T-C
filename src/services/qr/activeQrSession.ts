import { collection, doc, getDoc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { activeRealtimeService, isFirebaseActive } from '../realtime/realtimeServiceSwitch';
import { loadMockDatabase, saveMockDatabase, getRoomByCode } from '../realtime/mockStorage';
import { eventBus } from '../realtime/broadcastChannel';
import type { MockRoomData } from '../realtime/types';

const RETURN_TO_KEY = 'lhtt_return_to';

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

  if (isFirebaseActive && db) {
    const q = query(collection(db, 'rooms'), where('teacherId', '==', teacherId));
    return onSnapshot(
      q,
      snap => {
        const list: MockRoomData[] = [];
        snap.docs.forEach(d => {
          const data = d.data() as MockRoomData;
          if (isRoomStillActive(data)) {
            list.push({
              ...data,
              id: d.id,
              roster: data.roster || [],
              participants: data.participants || {},
              liveQuestions: data.liveQuestions || {},
              submissions: data.submissions || {},
              scores: data.scores || {},
              scoreEvents: data.scoreEvents || {},
            });
          }
        });
        callback(sortActiveRooms(list));
      },
      err => {
        console.warn('[activeQrSession] Không thể tải danh sách phòng đang chiếu:', err.message);
        callback([]);
      }
    );
  }

  const emitMock = () => {
    const mockDb = loadMockDatabase();
    const list = Object.values(mockDb.rooms || {}).filter(
      r => r.teacherId === teacherId && isRoomStillActive(r)
    );
    callback(sortActiveRooms(list));
  };

  emitMock();
  return eventBus.subscribe(() => {
    emitMock();
  });
}

export async function closeTeacherRoom(roomId: string): Promise<boolean> {
  if (!roomId) return false;
  try {
    const ok = await Promise.resolve(activeRealtimeService.finishRoom(roomId));
    if (ok) return true;
  } catch {
    // Fallback to direct status update if summary generation fails on a stale room
  }

  if (isFirebaseActive && db) {
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        status: 'FINISHED',
        finishedAt: new Date().toISOString(),
        activeGameId: null,
        activeGame: null,
        calledStudent: null,
      });
      return true;
    } catch {
      return false;
    }
  }

  const mockDb = loadMockDatabase();
  if (mockDb.rooms?.[roomId]) {
    mockDb.rooms[roomId].status = 'FINISHED';
    mockDb.rooms[roomId].finishedAt = new Date().toISOString();
    saveMockDatabase(mockDb);
    eventBus.publish({
      type: 'ROOM_UPDATED',
      roomId,
      payload: mockDb.rooms[roomId],
      timestamp: new Date().toISOString(),
    });
    return true;
  }
  return false;
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

  if (isFirebaseActive && db) {
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
    } catch {
      return null;
    }
  }

  const room = getRoomByCode(clean);
  if (!room || room.status === 'FINISHED') return null;
  return {
    roomId: room.id,
    className: room.className || 'Lớp học',
    subject: room.subject || '',
    responseMode: room.responseMode,
  };
}
