import { useState, useEffect } from 'react';
import type { MockRoomData } from '../services/realtime/types';
import { activeRealtimeService } from '../services/realtime/realtimeServiceSwitch';

export const useRoomRealtime = (roomId: string | null) => {
  const [room, setRoom] = useState<MockRoomData | null>(null);

  useEffect(() => {
    if (!roomId) return;

    let active = true;
    const unsubscribe = activeRealtimeService.subscribeRoom(roomId, (updatedRoom) => {
      if (active) setRoom({ ...updatedRoom });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [roomId]);

  return room?.id === roomId ? room : null;
};
