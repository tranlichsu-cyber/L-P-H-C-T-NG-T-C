import type { MockRoomData } from './types';

const STORAGE_KEY = 'lhtt_mock_database';
const MAX_CACHED_ROOMS = 10;

export interface MockDatabase {
  rooms: Record<string, MockRoomData>; // roomId -> MockRoomData
  privateQuestions: Record<string, Record<string, {
    correctAnswer: string;
    explanation?: string;
    correctPoints?: number;
    wrongPenalty?: number;
  }>>; // roomId -> { questionId -> PrivateAnswer }
}

const getInitialDB = (): MockDatabase => {
  return {
    rooms: {},
    privateQuestions: {},
  };
};

let memoryDb: MockDatabase | null = null;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

function normalizeAndPruneDatabase(db: MockDatabase): MockDatabase {
  if (!db.rooms || typeof db.rooms !== 'object') db.rooms = {};
  if (!db.privateQuestions || typeof db.privateQuestions !== 'object') db.privateQuestions = {};

  const entries = Object.entries(db.rooms);
  if (entries.length > MAX_CACHED_ROOMS) {
    entries.sort(([, a], [, b]) => {
      const aActive = a?.status !== 'FINISHED' ? 1 : 0;
      const bActive = b?.status !== 'FINISHED' ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      const tA = Date.parse(String(a?.createdAt || '')) || 0;
      const tB = Date.parse(String(b?.createdAt || '')) || 0;
      return tB - tA;
    });
    const keepIds = new Set(entries.slice(0, MAX_CACHED_ROOMS).map(([id]) => id));
    for (const [id] of entries) {
      if (!keepIds.has(id)) {
        delete db.rooms[id];
        delete db.privateQuestions[id];
      }
    }
  }

  Object.values(db.rooms).forEach((room) => {
    if (!room) return;
    if (!room.scores) room.scores = {};
    if (!room.scoreEvents) room.scoreEvents = {};
    if (room.calledStudent === undefined) room.calledStudent = null;
    if (!room.callHistory) room.callHistory = [];
  });

  return db;
}

function flushPersistMockDb(): void {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  if (!memoryDb) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryDb));
  } catch (err) {
    console.error('Failed to save mock database to localStorage', err);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      memoryDb = null;
    }
  });
  window.addEventListener('pagehide', flushPersistMockDb);
}

export const loadMockDatabase = (): MockDatabase => {
  if (memoryDb) return memoryDb;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      memoryDb = getInitialDB();
      return memoryDb;
    }
    const parsed: MockDatabase = JSON.parse(raw);
    memoryDb = normalizeAndPruneDatabase(parsed);
    return memoryDb;
  } catch (err) {
    console.error('Failed to load mock database from localStorage', err);
    memoryDb = getInitialDB();
    return memoryDb;
  }
};

export const saveMockDatabase = (db: MockDatabase): void => {
  memoryDb = normalizeAndPruneDatabase(db);
  if (typeof window === 'undefined') {
    flushPersistMockDb();
    return;
  }
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(flushPersistMockDb, 180);
};

export const getRoomById = (roomId: string): MockRoomData | null => {
  const db = loadMockDatabase();
  return db.rooms[roomId] || null;
};

export const getRoomByCode = (code: string): MockRoomData | null => {
  const db = loadMockDatabase();
  const rooms = Object.values(db.rooms);
  return rooms.find((r) => r.roomCode === code && r.status !== 'FINISHED') || null;
};
