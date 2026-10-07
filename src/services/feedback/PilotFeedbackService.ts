import { db } from '../firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { APP_VERSION } from '../../config/appConfig';

export interface PilotFeedbackEntry {
  id: string;
  role: 'TEACHER' | 'STUDENT';
  rating: number; // 1 to 5
  emojiReaction?: 'HAPPY' | 'NEUTRAL' | 'SAD';
  category?: 'USABILITY' | 'SPEED' | 'STABILITY' | 'INTERFACE' | 'OTHER';
  comment?: string;
  appVersion: string;
  browserInfo: string;
  createdAt: string;
}

const LOCAL_FEEDBACK_KEY = 'lhtt_pilot_feedback';

export class PilotFeedbackService {
  private static getBrowserInfo(): string {
    return `${navigator.userAgent.substring(0, 80)}`;
  }

  public static async submitFeedback(
    entry: Omit<PilotFeedbackEntry, 'id' | 'appVersion' | 'browserInfo' | 'createdAt'>
  ): Promise<boolean> {
    const feedbackId = `fb-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const fullEntry: PilotFeedbackEntry = {
      ...entry,
      id: feedbackId,
      appVersion: APP_VERSION,
      browserInfo: this.getBrowserInfo(),
      createdAt: new Date().toISOString(),
    };

    // Save to LocalStorage
    try {
      const existingRaw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
      const list: PilotFeedbackEntry[] = existingRaw ? JSON.parse(existingRaw) : [];
      list.unshift(fullEntry);
      localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save feedback locally', e);
    }

    // Save to Firestore if connected
    if (db) {
      try {
        const fbRef = doc(db, 'pilotFeedback', feedbackId);
        await setDoc(fbRef, fullEntry);
      } catch (err) {
        console.warn('Firestore feedback submit offline fallback', err);
      }
    }

    return true;
  }

  public static getLocalFeedbackList(): PilotFeedbackEntry[] {
    try {
      const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
