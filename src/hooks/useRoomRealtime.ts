import { useState, useEffect, useRef } from 'react';
import type { MockRoomData } from '../services/realtime/types';
import { activeRealtimeService } from '../services/realtime/realtimeServiceSwitch';
import { useAuth } from '../context/AuthContext';

export const useRoomRealtime = (roomId: string | null) => {
  const [room, setRoom] = useState<MockRoomData | null>(null);
  const { currentUser, authReady } = useAuth();
  const lastSnapshotSigRef = useRef<string>('');

  useEffect(() => {
    if (!roomId || !authReady) return;

    let active = true;
    lastSnapshotSigRef.current = '';
    const unsubscribe = activeRealtimeService.subscribeRoom(roomId, (updatedRoom) => {
      if (!active) return;
      try {
        const sig = JSON.stringify(updatedRoom);
        if (sig === lastSnapshotSigRef.current) return;
        lastSnapshotSigRef.current = sig;
      } catch {
        // Fallback if serialization fails
      }
      setRoom({ ...updatedRoom });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [roomId, authReady, currentUser?.uid, currentUser?.isAnonymous]);

  return room?.id === roomId ? room : null;
};
