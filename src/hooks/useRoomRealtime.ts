import { useState, useEffect } from 'react';
import type { MockRoomData } from '../services/realtime/types';
import { activeRealtimeService } from '../services/realtime/realtimeServiceSwitch';

export const useRoomRealtime = (roomId: string | null) => {
  const [room, setRoom] = useState<MockRoomData | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = activeRealtimeService.subscribeRoom(roomId, (updatedRoom) => {
      setRoom({ ...updatedRoom });
    });

    return () => {
      unsubscribe();
    };
  }, [roomId]);

  return room;
};
