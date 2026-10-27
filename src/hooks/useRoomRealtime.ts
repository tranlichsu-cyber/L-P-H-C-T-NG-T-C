import { useState, useEffect } from 'react';
import type { MockRoomData } from '../services/realtime/types';
import { activeRealtimeService } from '../services/realtime/realtimeServiceSwitch';
import { useAuth } from '../context/AuthContext';

export const useRoomRealtime = (roomId: string | null) => {
  const [room, setRoom] = useState<MockRoomData | null>(null);
  const { currentUser, authReady } = useAuth();

  useEffect(() => {
    if (!roomId || !authReady) return;

    let active = true;
    const unsubscribe = activeRealtimeService.subscribeRoom(roomId, (updatedRoom) => {
      if (active) setRoom({ ...updatedRoom });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [roomId, authReady, currentUser?.uid, currentUser?.isAnonymous]);

  return room?.id === roomId ? room : null;
};
