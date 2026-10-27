import type { SlideOutlineItem } from './pptxParser';

export interface LessonRemoteState {
  sessionId: string;
  lessonId: string;
  teacherId: string;
  title: string;
  subject: string;
  grade: string;
  page: number;
  count: number;
  blackout: boolean;
  animStep?: number;
  maxAnimSteps?: number;
  outlines: SlideOutlineItem[];
  updatedAt: string;
}

export interface LessonRemoteCommand {
  type: 'PPT_COMMAND';
  sessionId: string;
  action: 'SET_PAGE' | 'NEXT' | 'PREV' | 'TOGGLE_BLACKOUT' | 'PING_STATE' | 'NEXT_STEP' | 'PREV_STEP';
  page?: number;
}

type SyncEnvelope =
  | { type: 'PPT_STATE'; state: LessonRemoteState; senderId: string }
  | { type: 'PPT_STOP'; sessionId: string; teacherId: string; senderId: string }
  | (LessonRemoteCommand & { senderId: string });

const STORAGE_STATE_PREFIX = 'lhtt_ppt_state_';
const STORAGE_ACTIVE_TEACHER_PREFIX = 'lhtt_ppt_active_tchr_';
const NTFY_BASE_URL = 'https://ntfy.sh';

const TAB_SENDER_ID =
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);

const bc =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('lhtt_ppt_remote_channel') : null;

function sanitizeTopicSegment(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 48);
}

function getSessionTopic(sessionId: string): string {
  return `lhtt_ppt_s_${sanitizeTopicSegment(sessionId)}`;
}

function getTeacherTopic(teacherId: string): string {
  return `lhtt_ppt_t_${sanitizeTopicSegment(teacherId)}`;
}

async function postToNtfy(topic: string, payload: SyncEnvelope): Promise<void> {
  if (typeof fetch === 'undefined') return;
  try {
    // Compact outlines if payload is large so it always fits ntfy message size limits (< 3.5 KB)
    let bodyJson = JSON.stringify(payload);
    if (bodyJson.length > 3500 && payload.type === 'PPT_STATE') {
      const compactOutlines = payload.state.outlines.slice(0, 45).map(item => ({
        index: item.index,
        title: item.title.slice(0, 48),
        summary: item.summary.slice(0, 60),
        notes: item.notes ? item.notes.slice(0, 90) : undefined,
      }));
      bodyJson = JSON.stringify({
        ...payload,
        state: {
          ...payload.state,
          outlines: compactOutlines,
        },
      });
    }
    await fetch(`${NTFY_BASE_URL}/${topic}`, {
      method: 'POST',
      body: bodyJson,
    });
  } catch {
    // Ignore transient network errors
  }
}

export function loadCachedLessonState(sessionId: string): LessonRemoteState | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_STATE_PREFIX}${sessionId}`);
    if (!raw) return null;
    return JSON.parse(raw) as LessonRemoteState;
  } catch {
    return null;
  }
}

function saveCachedLessonState(state: LessonRemoteState): void {
  try {
    localStorage.setItem(`${STORAGE_STATE_PREFIX}${state.sessionId}`, JSON.stringify(state));
    if (state.teacherId) {
      localStorage.setItem(
        `${STORAGE_ACTIVE_TEACHER_PREFIX}${state.teacherId}`,
        JSON.stringify(state)
      );
    }
  } catch {
    // Ignore storage quota
  }
}

export function publishLessonRemoteState(state: LessonRemoteState): void {
  saveCachedLessonState(state);
  const envelope: SyncEnvelope = {
    type: 'PPT_STATE',
    state,
    senderId: TAB_SENDER_ID,
  };
  try {
    bc?.postMessage(envelope);
  } catch {
    // Ignore
  }
  void postToNtfy(getSessionTopic(state.sessionId), envelope);
  if (state.teacherId) {
    void postToNtfy(getTeacherTopic(state.teacherId), envelope);
  }
}

export function stopLessonRemoteSession(sessionId: string, teacherId?: string): void {
  try {
    localStorage.removeItem(`${STORAGE_STATE_PREFIX}${sessionId}`);
    if (teacherId) {
      localStorage.removeItem(`${STORAGE_ACTIVE_TEACHER_PREFIX}${teacherId}`);
    }
  } catch {
    // Ignore
  }
  const envelope: SyncEnvelope = {
    type: 'PPT_STOP',
    sessionId,
    teacherId: teacherId || '',
    senderId: TAB_SENDER_ID,
  };
  try {
    bc?.postMessage(envelope);
  } catch {
    // Ignore
  }
  void postToNtfy(getSessionTopic(sessionId), envelope);
  if (teacherId) {
    void postToNtfy(getTeacherTopic(teacherId), envelope);
  }
}

export function sendLessonRemoteCommand(
  sessionId: string,
  command: Omit<LessonRemoteCommand, 'type' | 'sessionId'>
): void {
  const envelope: SyncEnvelope = {
    type: 'PPT_COMMAND',
    sessionId,
    ...command,
    senderId: TAB_SENDER_ID,
  };
  try {
    bc?.postMessage(envelope);
  } catch {
    // Ignore
  }
  void postToNtfy(getSessionTopic(sessionId), envelope);
}

function openNtfyStream(topic: string, onEnvelope: (env: SyncEnvelope) => void): () => void {
  if (typeof EventSource === 'undefined') return () => {};
  let es: EventSource | null = null;
  let disposed = false;

  try {
    es = new EventSource(`${NTFY_BASE_URL}/${topic}/sse?since=10m`);
    es.onmessage = evt => {
      if (disposed) return;
      try {
        const wrapper = JSON.parse(evt.data) as { event?: string; message?: string };
        if (wrapper.event && wrapper.event !== 'message') return;
        const rawMsg = wrapper.message || evt.data;
        if (typeof rawMsg !== 'string' || !rawMsg.startsWith('{')) return;
        const parsed = JSON.parse(rawMsg) as SyncEnvelope;
        if (parsed && parsed.senderId !== TAB_SENDER_ID) {
          onEnvelope(parsed);
        }
      } catch {
        // Ignore non-JSON lines
      }
    };
  } catch {
    // Ignore SSE failures
  }

  return () => {
    disposed = true;
    try {
      es?.close();
    } catch {
      // Ignore
    }
  };
}

export function subscribeLessonPresenter(
  sessionId: string,
  getCurrentState: () => LessonRemoteState | null,
  onCommand: (cmd: LessonRemoteCommand) => void
): () => void {
  const handleEnvelope = (env: SyncEnvelope) => {
    if (env.type !== 'PPT_COMMAND' || env.sessionId !== sessionId) return;
    if (env.action === 'PING_STATE') {
      const current = getCurrentState();
      if (current) publishLessonRemoteState(current);
      return;
    }
    onCommand(env);
  };

  const onBcMessage = (evt: MessageEvent<SyncEnvelope>) => {
    if (evt.data && evt.data.senderId !== TAB_SENDER_ID) {
      handleEnvelope(evt.data);
    }
  };

  bc?.addEventListener('message', onBcMessage);
  const closeSse = openNtfyStream(getSessionTopic(sessionId), handleEnvelope);

  return () => {
    bc?.removeEventListener('message', onBcMessage);
    closeSse();
  };
}

export function subscribeLessonPhoneRemote(
  sessionId: string,
  onState: (state: LessonRemoteState) => void,
  onStopped?: () => void
): () => void {
  const cached = loadCachedLessonState(sessionId);
  if (cached) {
    onState(cached);
  }

  const handleEnvelope = (env: SyncEnvelope) => {
    if (env.type === 'PPT_STATE' && env.state.sessionId === sessionId) {
      saveCachedLessonState(env.state);
      onState(env.state);
    } else if (env.type === 'PPT_STOP' && env.sessionId === sessionId) {
      onStopped?.();
    }
  };

  const onBcMessage = (evt: MessageEvent<SyncEnvelope>) => {
    if (evt.data && evt.data.senderId !== TAB_SENDER_ID) {
      handleEnvelope(evt.data);
    }
  };

  const onStorage = (evt: StorageEvent) => {
    if (evt.key === `${STORAGE_STATE_PREFIX}${sessionId}` && evt.newValue) {
      try {
        onState(JSON.parse(evt.newValue) as LessonRemoteState);
      } catch {
        // Ignore
      }
    }
  };

  bc?.addEventListener('message', onBcMessage);
  window.addEventListener('storage', onStorage);
  const closeSse = openNtfyStream(getSessionTopic(sessionId), handleEnvelope);

  // Request latest slide state from the presenter immediately
  sendLessonRemoteCommand(sessionId, { action: 'PING_STATE' });

  return () => {
    bc?.removeEventListener('message', onBcMessage);
    window.removeEventListener('storage', onStorage);
    closeSse();
  };
}

export function subscribeActiveTeacherPresentation(
  teacherId: string | undefined | null,
  onState: (state: LessonRemoteState | null) => void
): () => void {
  if (!teacherId) {
    onState(null);
    return () => {};
  }

  const isRecentState = (state: LessonRemoteState | null): boolean => {
    if (!state) return false;
    const ts = Date.parse(state.updatedAt);
    if (!Number.isFinite(ts)) return true;
    return Date.now() - ts < 3 * 60 * 60 * 1000; // 3 hours
  };

  try {
    const raw = localStorage.getItem(`${STORAGE_ACTIVE_TEACHER_PREFIX}${teacherId}`);
    if (raw) {
      const parsed = JSON.parse(raw) as LessonRemoteState;
      if (isRecentState(parsed)) {
        onState(parsed);
      }
    }
  } catch {
    // Ignore
  }

  const handleEnvelope = (env: SyncEnvelope) => {
    if (env.type === 'PPT_STATE' && env.state.teacherId === teacherId) {
      saveCachedLessonState(env.state);
      onState(env.state);
    } else if (env.type === 'PPT_STOP' && env.teacherId === teacherId) {
      onState(null);
    }
  };

  const onBcMessage = (evt: MessageEvent<SyncEnvelope>) => {
    if (evt.data && evt.data.senderId !== TAB_SENDER_ID) {
      handleEnvelope(evt.data);
    }
  };

  bc?.addEventListener('message', onBcMessage);
  const closeSse = openNtfyStream(getTeacherTopic(teacherId), handleEnvelope);

  return () => {
    bc?.removeEventListener('message', onBcMessage);
    closeSse();
  };
}
