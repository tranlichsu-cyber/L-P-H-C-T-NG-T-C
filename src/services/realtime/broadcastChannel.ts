import type { RealtimeEvent } from './types';

const CHANNEL_NAME = 'lop-hoc-tuong-tac-room';

type EventCallback = (event: RealtimeEvent) => void;

class EventBus {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<EventCallback> = new Set();

  constructor() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (e: MessageEvent<RealtimeEvent>) => {
          if (e.data && e.data.type) {
            this.notifyListeners(e.data);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel init failed, fallback to storage events', err);
      }
    }

    // Fallback: window storage event
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e: StorageEvent) => {
        if (e.key === 'lhtt_realtime_event' && e.newValue) {
          try {
            const event: RealtimeEvent = JSON.parse(e.newValue);
            this.notifyListeners(event);
          } catch (err) {
            // Ignore parse errors
          }
        }
      });
    }
  }

  public publish(event: RealtimeEvent): void {
    // 1. Notify listeners in current tab
    this.notifyListeners(event);

    // 2. Broadcast to other tabs via BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch (err) {
        console.warn('BroadcastChannel postMessage failed', err);
      }
    }

    // 3. Update localStorage fallback key to trigger storage event in other tabs
    try {
      localStorage.setItem('lhtt_realtime_event', JSON.stringify(event));
    } catch (err) {
      // Ignore quota errors
    }
  }

  public subscribe(callback: EventCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(event: RealtimeEvent): void {
    this.listeners.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.error('Error in realtime listener callback', err);
      }
    });
  }
}

export const eventBus = new EventBus();
