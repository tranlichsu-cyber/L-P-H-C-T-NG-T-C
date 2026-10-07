import { realtimeService, MockRealtimeService } from './MockRealtimeService';
import { firestoreRealtimeService } from '../firebase/FirestoreRealtimeService';
import { isFirebaseConfigured } from '../firebase/firebase';

const dataMode = import.meta.env.VITE_DATA_MODE || 'mock';

export const isFirebaseActive = dataMode === 'firebase' && isFirebaseConfigured;

// Export active realtime service instance
export const activeRealtimeService: MockRealtimeService = (
  isFirebaseActive ? (firestoreRealtimeService as any) : realtimeService
);

console.info(
  `[REALTIME SERVICE] Đang hoạt động ở chế độ: ${
    isFirebaseActive ? '🔥 FIREBASE FIRESTORE PRODUCTION' : '📦 MOCK REALTIME (BroadcastChannel)'
  }`
);
