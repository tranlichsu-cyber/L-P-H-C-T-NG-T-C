import type { MockRoomData } from './types';

const STORAGE_KEY = 'lhtt_mock_database';

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

export const loadMockDatabase = (): MockDatabase => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialDB();
    const db: MockDatabase = JSON.parse(raw);
    
    // Normalize room objects
    Object.values(db.rooms || {}).forEach((room) => {
      if (!room.scores) room.scores = {};
      if (!room.scoreEvents) room.scoreEvents = {};
      if (room.calledStudent === undefined) room.calledStudent = null;
      if (!room.callHistory) room.callHistory = [];
    });

    return db;
  } catch (err) {
    console.error('Failed to load mock database from localStorage', err);
    return getInitialDB();
  }
};

export const saveMockDatabase = (db: MockDatabase): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to save mock database to localStorage', err);
  }
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
