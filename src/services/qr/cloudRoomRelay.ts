import { auth } from '../firebase/firebase';
import { eventBus } from '../realtime/broadcastChannel';
import { loadMockDatabase, saveMockDatabase } from '../realtime/mockStorage';
import { realtimeService } from '../realtime/MockRealtimeService';
import type { CardChoice } from './cards';
import type { LiveQuestionPublic, MockRoomData } from '../realtime/types';

const QUOTA_FLAG_KEY = 'lhtt_fs_quota_exceeded_at';
const QUOTA_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes
const RTDB_BASE_URL =
  'https://lop-hoc-tuong-tac-a62a5-default-rtdb.asia-southeast1.firebasedatabase.app';
const NTFY_BASE_URL = 'https://ntfy.sh';

const SENDER_ID = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

let memoryQuotaExceededAt = 0;

export type PrivateAnswerMap = Record<
  string,
  {
    correctAnswer: string;
    explanation?: string;
    correctPoints?: number;
    wrongPenalty?: number;
  }
>;

export type RelayActionPayload =
  | { kind: 'OPEN_QUESTION'; questionId: string }
  | { kind: 'CLOSE_QUESTION'; questionId: string }
  | { kind: 'SHOW_RESULT'; questionId: string }
  | { kind: 'SUBMIT_QR_ANSWER'; questionId: string; studentId: string; choice: CardChoice }
  | { kind: 'FINISH_ROOM' };

type RelayEnvelope =
  | {
      type: 'ROOM_STATE';
      senderId: string;
      roomId: string;
      teacherId?: string;
      room: MockRoomData;
      privateQuestions?: PrivateAnswerMap;
      ts: number;
    }
  | {
      type: 'ROOM_ACTION';
      senderId: string;
      roomId: string;
      teacherId?: string;
      action: RelayActionPayload;
      ts: number;
    }
  | {
      type: 'REQUEST_STATE';
      senderId: string;
      roomId: string;
      ts: number;
    }
  | {
      type: 'REQUEST_TEACHER_ROOMS';
      senderId: string;
      teacherId: string;
      ts: number;
    };

export function isQuotaExceededError(err: unknown): boolean {
  if (!err) return false;
  const maybe = err as { code?: string; message?: string; name?: string };
  const code = String(maybe.code || '').toLowerCase();
  const msg = String(maybe.message || err || '').toLowerCase();
  return (
    code === 'resource-exhausted' ||
    code.includes('quota') ||
    msg.includes('quota exceeded') ||
    msg.includes('resource-exhausted') ||
    msg.includes('resource_exhausted') ||
    msg.includes('too many requests') ||
    msg.includes('429')
  );
}

export function markFirestoreQuotaExceeded(): void {
  const now = Date.now();
  memoryQuotaExceededAt = now;
  try {
    sessionStorage.setItem(QUOTA_FLAG_KEY, String(now));
  } catch {
    // Ignore storage errors
  }
}

export function isFirestoreTemporarilyExhausted(): boolean {
  const now = Date.now();
  if (memoryQuotaExceededAt && now - memoryQuotaExceededAt < QUOTA_COOLDOWN_MS) {
    return true;
  }
  try {
    const raw = sessionStorage.getItem(QUOTA_FLAG_KEY);
    if (raw) {
      const ts = Number(raw);
      if (Number.isFinite(ts) && now - ts < QUOTA_COOLDOWN_MS) {
        memoryQuotaExceededAt = ts;
        return true;
      }
    }
  } catch {
    // Ignore
  }
  return false;
}

function sanitizeTopicSegment(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 48);
}

function getRoomTopic(roomId: string): string {
  return `lhtt_rm2_${sanitizeTopicSegment(roomId)}`;
}

function getTeacherTopic(teacherId: string): string {
  return `lhtt_tc2_${sanitizeTopicSegment(teacherId)}`;
}

export function mergeRoomData(
  existing: MockRoomData | undefined | null,
  incoming: MockRoomData
): MockRoomData {
  if (!existing) {
    return {
      ...incoming,
      roster: incoming.roster || [],
      participants: incoming.participants || {},
      liveQuestions: incoming.liveQuestions || {},
      submissions: incoming.submissions || {},
      scores: incoming.scores || {},
      scoreEvents: incoming.scoreEvents || {},
    };
  }

  const mergedQuestions: Record<string, LiveQuestionPublic> = {
    ...(existing.liveQuestions || {}),
  };
  for (const [qId, qVal] of Object.entries(incoming.liveQuestions || {})) {
    const prevQ = mergedQuestions[qId];
    mergedQuestions[qId] = {
      ...(prevQ || {}),
      ...qVal,
      // Keep local base64 media if relay packet stripped it for size
      media:
        qVal.media?.imageUrl || qVal.media?.videoUrl
          ? { ...(prevQ?.media || {}), ...qVal.media }
          : prevQ?.media || qVal.media,
    };
  }

  const mergedSubmissions: MockRoomData['submissions'] = {
    ...(existing.submissions || {}),
  };
  for (const [subKey, subVal] of Object.entries(incoming.submissions || {})) {
    const prevSub = mergedSubmissions[subKey];
    mergedSubmissions[subKey] = {
      ...(prevSub || {}),
      ...subVal,
      ...(subVal.isCorrect !== undefined
        ? { isCorrect: subVal.isCorrect }
        : prevSub?.isCorrect !== undefined
          ? { isCorrect: prevSub.isCorrect }
          : {}),
    };
  }

  const mergedParticipants: MockRoomData['participants'] = {
    ...(existing.participants || {}),
    ...(incoming.participants || {}),
  };

  const mergedScoreEvents: MockRoomData['scoreEvents'] = {
    ...(existing.scoreEvents || {}),
    ...(incoming.scoreEvents || {}),
  };

  const mergedScores: MockRoomData['scores'] = {
    ...(existing.scores || {}),
    ...(incoming.scores || {}),
  };

  const isFinished = existing.status === 'FINISHED' || incoming.status === 'FINISHED';

  return {
    ...existing,
    ...incoming,
    status: isFinished ? 'FINISHED' : incoming.status || existing.status,
    finishedAt: incoming.finishedAt || existing.finishedAt,
    activeQuestionId:
      incoming.activeQuestionId !== undefined
        ? incoming.activeQuestionId
        : existing.activeQuestionId,
    roster: incoming.roster?.length ? incoming.roster : existing.roster || [],
    questionOrder: incoming.questionOrder?.length
      ? incoming.questionOrder
      : existing.questionOrder,
    liveQuestions: mergedQuestions,
    submissions: mergedSubmissions,
    participants: mergedParticipants,
    scores: mergedScores,
    scoreEvents: mergedScoreEvents,
  };
}

function normalizeChoiceAnswer(rawAnswer: string, options?: string[]): string {
  const trimmed = String(rawAnswer || '').trim();
  if (/^[A-D]$/i.test(trimmed)) return trimmed.toUpperCase();
  if (options?.length) {
    const idx = options.findIndex(
      o => o.trim().toLocaleLowerCase('vi-VN') === trimmed.toLocaleLowerCase('vi-VN')
    );
    if (idx >= 0 && idx < 4) return String.fromCharCode(65 + idx);
  }
  return trimmed;
}

export function ensureRoomPrivateQuestions(roomId: string): PrivateAnswerMap {
  const mockDb = loadMockDatabase();
  const existing = mockDb.privateQuestions[roomId] || {};
  const room = mockDb.rooms[roomId];
  if (!room) return existing;

  const liveIds = Object.keys(room.liveQuestions || {});
  const allPresent = liveIds.length > 0 && liveIds.every(qId => Boolean(existing[qId]?.correctAnswer));
  if (allPresent) return existing;

  const teacherId = room.teacherId || auth?.currentUser?.uid || '';
  const discovered: PrivateAnswerMap = { ...existing };

  // 1. Check cached QR Banks in localStorage
  if (teacherId) {
    try {
      const rawBanks = localStorage.getItem(`qr-question-banks-v1-${teacherId}`);
      if (rawBanks) {
        const banks = JSON.parse(rawBanks) as Array<{
          id: string;
          questions?: Array<{
            id: string;
            options?: string[];
            correctAnswer?: string;
            explanation?: string;
            correctPoints?: number;
            wrongPenalty?: number;
          }>;
        }>;
        for (const bank of banks) {
          for (const q of bank.questions || []) {
            if (q.id && q.correctAnswer && !discovered[q.id]) {
              discovered[q.id] = {
                correctAnswer:
                  room.responseMode === 'QR_CARD'
                    ? normalizeChoiceAnswer(q.correctAnswer, q.options)
                    : q.correctAnswer,
                explanation: q.explanation,
                correctPoints: q.correctPoints ?? 10,
                wrongPenalty: q.wrongPenalty ?? 0,
              };
            }
          }
        }
      }
    } catch {
      // Ignore
    }

    // 2. Check cached Teacher Quizzes in localStorage
    try {
      const rawQuizzes = localStorage.getItem(`lhtt_teacher_quizzes_v1_${teacherId}`);
      if (rawQuizzes) {
        const parsed = JSON.parse(rawQuizzes) as {
          items?: Array<{
            id: string;
            questions?: Array<{
              id: string;
              options?: string[];
              correctAnswer?: string;
              explanation?: string;
              correctPoints?: number;
              wrongPenalty?: number;
            }>;
          }>;
        };
        for (const quiz of parsed.items || []) {
          for (const q of quiz.questions || []) {
            if (q.id && q.correctAnswer && !discovered[q.id]) {
              discovered[q.id] = {
                correctAnswer:
                  room.responseMode === 'QR_CARD'
                    ? normalizeChoiceAnswer(q.correctAnswer, q.options)
                    : q.correctAnswer,
                explanation: q.explanation,
                correctPoints: q.correctPoints ?? 10,
                wrongPenalty: q.wrongPenalty ?? 5,
              };
            }
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  // 3. Ensure every live question has a valid private answer entry so grading never blocks
  for (const qId of liveIds) {
    const liveQ = room.liveQuestions[qId];
    if (!discovered[qId]?.correctAnswer) {
      discovered[qId] = {
        correctAnswer: liveQ?.correctAnswer || 'A',
        explanation: liveQ?.explanation || '',
        correctPoints: liveQ?.correctPoints ?? 10,
        wrongPenalty: liveQ?.wrongPenalty ?? 0,
      };
    }
  }

  mockDb.privateQuestions[roomId] = discovered;
  saveMockDatabase(mockDb);
  return discovered;
}

export function cacheRoomLocally(
  room: MockRoomData,
  privateQuestions?: PrivateAnswerMap
): MockRoomData {
  const mockDb = loadMockDatabase();
  const merged = mergeRoomData(mockDb.rooms[room.id], room);
  mockDb.rooms[room.id] = merged;
  if (privateQuestions && Object.keys(privateQuestions).length > 0) {
    mockDb.privateQuestions[room.id] = {
      ...(mockDb.privateQuestions[room.id] || {}),
      ...privateQuestions,
    };
  }
  saveMockDatabase(mockDb);
  return merged;
}

function stripLargeBase64ForRelay(room: MockRoomData): MockRoomData {
  const cleanQuestions: Record<string, LiveQuestionPublic> = {};
  for (const [k, q] of Object.entries(room.liveQuestions || {})) {
    const img = q.media?.imageUrl;
    const isLargeDataUri = Boolean(img && img.startsWith('data:') && img.length > 600);
    if (isLargeDataUri) {
      cleanQuestions[k] = {
        ...q,
        media: q.media?.videoUrl ? { videoUrl: q.media.videoUrl, imageAlt: q.media.imageAlt } : undefined,
      };
    } else {
      cleanQuestions[k] = q;
    }
  }
  return {
    ...room,
    liveQuestions: cleanQuestions,
  };
}

async function publishToNtfyTopic(topic: string, envelope: RelayEnvelope): Promise<void> {
  if (typeof fetch !== 'function') return;
  try {
    const raw = JSON.stringify(envelope);
    const chunkSize = 2400;
    if (raw.length <= chunkSize) {
      await fetch(`${NTFY_BASE_URL}/${topic}`, {
        method: 'POST',
        body: raw,
      });
      return;
    }

    const total = Math.ceil(raw.length / chunkSize);
    const chunkId = `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    for (let i = 0; i < total; i++) {
      const slice = raw.slice(i * chunkSize, (i + 1) * chunkSize);
      await fetch(`${NTFY_BASE_URL}/${topic}`, {
        method: 'POST',
        body: JSON.stringify({ _c: chunkId, i, n: total, d: slice }),
      });
    }
  } catch {
    // Ignore transient network errors
  }
}

async function publishToRtdb(room: MockRoomData, privateQuestions?: PrivateAnswerMap): Promise<void> {
  if (typeof fetch !== 'function' || !auth?.currentUser) return;
  try {
    const token = await auth.currentUser.getIdToken();
    if (!token) return;
    const relayRoom = stripLargeBase64ForRelay(room);
    await fetch(
      `${RTDB_BASE_URL}/qrRelay/rooms/${encodeURIComponent(room.id)}.json?auth=${encodeURIComponent(token)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: relayRoom,
          privateQuestions: privateQuestions || {},
          updatedAt: Date.now(),
        }),
      }
    );
    if (room.teacherId) {
      await fetch(
        `${RTDB_BASE_URL}/qrRelay/teacherRooms/${encodeURIComponent(room.teacherId)}/${encodeURIComponent(room.id)}.json?auth=${encodeURIComponent(token)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room: relayRoom,
            privateQuestions: privateQuestions || {},
            updatedAt: Date.now(),
          }),
        }
      );
    }
  } catch {
    // RTDB is an optional acceleration layer
  }
}

async function fetchFromRtdbRoom(
  roomId: string
): Promise<{ room: MockRoomData; privateQuestions?: PrivateAnswerMap } | null> {
  if (typeof fetch !== 'function' || !auth?.currentUser) return null;
  try {
    const token = await auth.currentUser.getIdToken();
    if (!token) return null;
    const res = await fetch(
      `${RTDB_BASE_URL}/qrRelay/rooms/${encodeURIComponent(roomId)}.json?auth=${encodeURIComponent(token)}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      room?: MockRoomData;
      privateQuestions?: PrivateAnswerMap;
    } | null;
    if (data?.room?.id) {
      return { room: data.room, privateQuestions: data.privateQuestions };
    }
  } catch {
    // Ignore
  }
  return null;
}

const roomListeners = new Map<string, Set<(room: MockRoomData) => void>>();
const teacherListeners = new Map<string, Set<(rooms: MockRoomData[]) => void>>();
const activeTopicStreams = new Map<string, { refCount: number; stop: () => void }>();

function notifyLocalRoomListeners(room: MockRoomData): void {
  const set = roomListeners.get(room.id);
  if (set) {
    for (const cb of [...set]) {
      try {
        cb(room);
      } catch {
        // Ignore callback error
      }
    }
  }

  const teacherId = room.teacherId;
  if (teacherId) {
    notifyLocalTeacherListeners(teacherId);
  }
}

function getActiveMockRoomsForTeacher(teacherId: string): MockRoomData[] {
  const mockDb = loadMockDatabase();
  return Object.values(mockDb.rooms || {})
    .filter(r => {
      if (!r || r.teacherId !== teacherId || r.status === 'FINISHED') return false;
      if (r.expiresAt) {
        const exp = Date.parse(r.expiresAt);
        if (Number.isFinite(exp) && exp < Date.now()) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const tA = Date.parse(String(a.createdAt || '')) || 0;
      const tB = Date.parse(String(b.createdAt || '')) || 0;
      if (tB !== tA) return tB - tA;
      return (b.responseMode === 'QR_CARD' ? 1 : 0) - (a.responseMode === 'QR_CARD' ? 1 : 0);
    });
}

function notifyLocalTeacherListeners(teacherId: string): void {
  const set = teacherListeners.get(teacherId);
  if (!set || set.size === 0) return;
  const activeList = getActiveMockRoomsForTeacher(teacherId);
  for (const cb of [...set]) {
    try {
      cb(activeList);
    } catch {
      // Ignore
    }
  }
}

function applyIncomingRelayAction(roomId: string, action: RelayActionPayload): MockRoomData | null {
  const mockDb = loadMockDatabase();
  if (!mockDb.rooms[roomId]) return null;

  switch (action.kind) {
    case 'OPEN_QUESTION':
      realtimeService.openQuestion(roomId, action.questionId);
      break;
    case 'CLOSE_QUESTION':
      realtimeService.closeQuestion(roomId, action.questionId);
      break;
    case 'SHOW_RESULT':
      ensureRoomPrivateQuestions(roomId);
      realtimeService.showQuestionResult(roomId, action.questionId);
      break;
    case 'SUBMIT_QR_ANSWER':
      realtimeService.submitQrAnswer(roomId, action.questionId, action.studentId, action.choice);
      break;
    case 'FINISH_ROOM':
      realtimeService.finishRoom(roomId);
      break;
  }

  const updated = loadMockDatabase().rooms[roomId];
  return updated || null;
}

function handleRelayEnvelope(envelope: RelayEnvelope): void {
  if (!envelope || envelope.senderId === SENDER_ID) return;

  if (envelope.type === 'ROOM_STATE' && envelope.room?.id) {
    const merged = cacheRoomLocally(envelope.room, envelope.privateQuestions);
    eventBus.publish({
      type: 'ROOM_UPDATED',
      roomId: merged.id,
      payload: merged,
      timestamp: new Date().toISOString(),
    });
    notifyLocalRoomListeners(merged);
    return;
  }

  if (envelope.type === 'ROOM_ACTION' && envelope.roomId && envelope.action) {
    const updated = applyIncomingRelayAction(envelope.roomId, envelope.action);
    if (updated) {
      notifyLocalRoomListeners(updated);
      // If we are the host holding private answers and the remote triggered SHOW_RESULT,
      // broadcast the authoritative scored ROOM_STATE back so the phone gets correctAnswers.
      if (envelope.action.kind === 'SHOW_RESULT') {
        void broadcastRoomState(updated.id);
      }
    }
    return;
  }

  if (envelope.type === 'REQUEST_STATE' && envelope.roomId) {
    const mockDb = loadMockDatabase();
    const room = mockDb.rooms[envelope.roomId];
    if (room && (room.roster?.length || Object.keys(room.liveQuestions || {}).length)) {
      void broadcastRoomState(room.id);
    }
    return;
  }

  if (envelope.type === 'REQUEST_TEACHER_ROOMS' && envelope.teacherId) {
    const rooms = getActiveMockRoomsForTeacher(envelope.teacherId);
    for (const r of rooms.slice(0, 5)) {
      void broadcastRoomState(r.id);
    }
  }
}

function acquireNtfyStream(topic: string, onOpen?: () => void): () => void {
  const existing = activeTopicStreams.get(topic);
  if (existing) {
    existing.refCount += 1;
    if (onOpen) setTimeout(onOpen, 50);
    return () => {
      existing.refCount -= 1;
      if (existing.refCount <= 0) {
        existing.stop();
        activeTopicStreams.delete(topic);
      }
    };
  }

  let cancelled = false;
  let abortController: AbortController | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  const chunkStore = new Map<string, Map<number, string>>();

  const connect = async () => {
    if (cancelled || typeof fetch !== 'function') return;
    abortController = new AbortController();
    try {
      const res = await fetch(`${NTFY_BASE_URL}/${topic}/json`, {
        signal: abortController.signal,
      });
      if (!res.ok || !res.body) throw new Error('Stream unavailable');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (!cancelled) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const evt = JSON.parse(trimmed) as {
              event?: string;
              message?: string;
            };
            if (evt.event === 'open') {
              onOpen?.();
            } else if (evt.event === 'message' && evt.message) {
              const parsed = JSON.parse(evt.message) as Record<string, unknown>;
              if (
                typeof parsed._c === 'string' &&
                typeof parsed.i === 'number' &&
                typeof parsed.n === 'number' &&
                typeof parsed.d === 'string'
              ) {
                let partMap = chunkStore.get(parsed._c);
                if (!partMap) {
                  partMap = new Map<number, string>();
                  chunkStore.set(parsed._c, partMap);
                }
                partMap.set(parsed.i, parsed.d);
                if (partMap.size === parsed.n) {
                  const fullJson = Array.from({ length: parsed.n }, (_, idx) =>
                    partMap!.get(idx) || ''
                  ).join('');
                  chunkStore.delete(parsed._c);
                  handleRelayEnvelope(JSON.parse(fullJson) as RelayEnvelope);
                }
              } else if (typeof parsed.type === 'string') {
                handleRelayEnvelope(parsed as unknown as RelayEnvelope);
              }
            }
          } catch {
            // Ignore malformed message
          }
        }
      }
    } catch {
      // Reconnect if not cancelled
    }

    if (!cancelled) {
      retryTimer = setTimeout(() => {
        void connect();
      }, 2000);
    }
  };

  void connect();

  const stop = () => {
    cancelled = true;
    if (retryTimer) clearTimeout(retryTimer);
    abortController?.abort();
  };

  const entry = { refCount: 1, stop };
  activeTopicStreams.set(topic, entry);

  return () => {
    entry.refCount -= 1;
    if (entry.refCount <= 0) {
      entry.stop();
      activeTopicStreams.delete(topic);
    }
  };
}

export async function broadcastRoomState(roomId: string): Promise<void> {
  const mockDb = loadMockDatabase();
  const room = mockDb.rooms[roomId];
  if (!room) return;
  const privateQuestions = ensureRoomPrivateQuestions(roomId);
  const relayRoom = stripLargeBase64ForRelay(room);

  const envelope: RelayEnvelope = {
    type: 'ROOM_STATE',
    senderId: SENDER_ID,
    roomId: room.id,
    teacherId: room.teacherId,
    room: relayRoom,
    privateQuestions,
    ts: Date.now(),
  };

  notifyLocalRoomListeners(room);
  void publishToRtdb(room, privateQuestions);
  await publishToNtfyTopic(getRoomTopic(room.id), envelope);
  if (room.teacherId) {
    await publishToNtfyTopic(getTeacherTopic(room.teacherId), envelope);
  }
}

export async function broadcastRoomAction(
  roomId: string,
  action: RelayActionPayload
): Promise<void> {
  const mockDb = loadMockDatabase();
  const room = mockDb.rooms[roomId];
  const envelope: RelayEnvelope = {
    type: 'ROOM_ACTION',
    senderId: SENDER_ID,
    roomId,
    teacherId: room?.teacherId,
    action,
    ts: Date.now(),
  };

  await publishToNtfyTopic(getRoomTopic(roomId), envelope);
  if (room) {
    await broadcastRoomState(roomId);
  }
}

export function requestRelaySync(roomId?: string, teacherId?: string): void {
  if (roomId) {
    void fetchFromRtdbRoom(roomId).then(found => {
      if (found?.room) {
        const merged = cacheRoomLocally(found.room, found.privateQuestions);
        notifyLocalRoomListeners(merged);
      }
    });
    void publishToNtfyTopic(getRoomTopic(roomId), {
      type: 'REQUEST_STATE',
      senderId: SENDER_ID,
      roomId,
      ts: Date.now(),
    });
  }
  if (teacherId) {
    void publishToNtfyTopic(getTeacherTopic(teacherId), {
      type: 'REQUEST_TEACHER_ROOMS',
      senderId: SENDER_ID,
      teacherId,
      ts: Date.now(),
    });
  }
}

export function subscribeRelayRoom(
  roomId: string,
  callback: (room: MockRoomData) => void
): () => void {
  if (!roomId) return () => {};

  let set = roomListeners.get(roomId);
  if (!set) {
    set = new Set();
    roomListeners.set(roomId, set);
  }
  set.add(callback);

  // 1. Emit immediately from local storage if present
  const localRoom = loadMockDatabase().rooms[roomId];
  if (localRoom) {
    callback(localRoom);
  }

  // 2. Listen to same-browser BroadcastChannel & storage events
  const unsubBus = eventBus.subscribe(evt => {
    if (evt.roomId !== roomId) return;
    const latest = loadMockDatabase().rooms[roomId];
    if (latest) callback(latest);
  });

  const onStorage = (e: StorageEvent) => {
    if (e.key === 'lhtt_mock_database') {
      const latest = loadMockDatabase().rooms[roomId];
      if (latest) callback(latest);
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }

  // 3. Connect to Ntfy live stream and request state from peer (Computer <-> Phone)
  const topic = getRoomTopic(roomId);
  const unsubStream = acquireNtfyStream(topic, () => {
    requestRelaySync(roomId, auth?.currentUser?.uid);
  });

  // Also check RTDB & send a retry sync request after 1.5s if room not yet populated
  requestRelaySync(roomId, auth?.currentUser?.uid);
  const retryTimer = setTimeout(() => {
    const current = loadMockDatabase().rooms[roomId];
    if (!current || !current.roster?.length) {
      requestRelaySync(roomId, auth?.currentUser?.uid);
    }
  }, 1600);

  return () => {
    clearTimeout(retryTimer);
    unsubBus();
    unsubStream();
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
    const listeners = roomListeners.get(roomId);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) roomListeners.delete(roomId);
    }
  };
}

export function subscribeRelayTeacherRooms(
  teacherId: string | undefined | null,
  callback: (rooms: MockRoomData[]) => void
): () => void {
  if (!teacherId) {
    callback([]);
    return () => {};
  }

  let set = teacherListeners.get(teacherId);
  if (!set) {
    set = new Set();
    teacherListeners.set(teacherId, set);
  }
  set.add(callback);

  callback(getActiveMockRoomsForTeacher(teacherId));

  const unsubBus = eventBus.subscribe(() => {
    callback(getActiveMockRoomsForTeacher(teacherId));
  });

  const onStorage = (e: StorageEvent) => {
    if (e.key === 'lhtt_mock_database') {
      callback(getActiveMockRoomsForTeacher(teacherId));
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }

  const topic = getTeacherTopic(teacherId);
  const unsubStream = acquireNtfyStream(topic, () => {
    requestRelaySync(undefined, teacherId);
  });

  const retryTimer = setTimeout(() => {
    if (getActiveMockRoomsForTeacher(teacherId).length === 0) {
      requestRelaySync(undefined, teacherId);
    }
  }, 1600);

  return () => {
    clearTimeout(retryTimer);
    unsubBus();
    unsubStream();
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
    const listeners = teacherListeners.get(teacherId);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) teacherListeners.delete(teacherId);
    }
  };
}
