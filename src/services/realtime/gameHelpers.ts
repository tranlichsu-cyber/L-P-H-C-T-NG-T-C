import type { GameType, GameSessionData, TeamData, MysteryDoorItem, KnowledgeBoxItem } from './types';

export const buildInitialGameSession = (
  roomId: string,
  type: GameType,
  settings: GameSessionData['settings'],
  questionIds: string[],
  participants: { studentId: string; name: string }[]
): GameSessionData => {
  if(settings.timerSeconds!==undefined&&(!Number.isInteger(settings.timerSeconds)||settings.timerSeconds<0||settings.timerSeconds>120))throw Error('Thời gian trò chơi cần từ 0 đến 120 giây.');
  if(settings.teamCount!==undefined&&(!Number.isInteger(settings.teamCount)||settings.teamCount<2||settings.teamCount>4))throw Error('Số đội cần từ 2 đến 4.');
  questionIds=[...new Set(questionIds)];
  if(type!=='RANDOM_WHEEL'&&!questionIds.length)throw Error('Thầy/cô cần thêm câu hỏi trước khi mở trò chơi này.');
  if(type==='RANDOM_WHEEL'&&!participants.length)throw Error('Hãy chờ học sinh vào phòng trước khi quay.');
  if(type==='TEAM_RACE'&&participants.length<(settings.teamCount||2))throw Error('Số học sinh cần ít nhất bằng số đội.');
  const now = new Date().toISOString();
  const gameId = `game-${Date.now()}`;

  const baseSession: GameSessionData = {
    id: gameId,
    roomId,
    type,
    status: 'READY',
    createdAt: now,
    settings: {
      timerSeconds: settings.timerSeconds || 0,
      enableSpeedScore: settings.enableSpeedScore || false,
      showRanking: settings.showRanking || false,
      fairnessUncalled: settings.fairnessUncalled ?? true,
      soundEnabled: settings.soundEnabled ?? true,
      doorCount: settings.doorCount || 6,
      boxCount: settings.boxCount || 6,
      teamCount: settings.teamCount || 2,
      teamNames: settings.teamNames || [],
      teamScoringMode: settings.teamScoringMode || 'CORRECT_COUNT',
    },
    currentRound: 1,
    questionIds,
    activeQuestionId: questionIds[0] || null,
  };

  // 1. RANDOM WHEEL
  if (type === 'RANDOM_WHEEL') {
    baseSession.calledStudentIds = [];
  }

  // 2. MYSTERY DOOR
  if (type === 'MYSTERY_DOOR') {
    const doorCount = Math.min(settings.doorCount || 6,questionIds.length);
    const doors: MysteryDoorItem[] = [];
    for (let i = 1; i <= doorCount; i++) {
      const qId = questionIds[(i - 1) % Math.max(1, questionIds.length)] || 'q1';
      doors.push({
        id: i,
        questionId: qId,
        isOpened: false,
      });
    }
    baseSession.doors = doors;
  }

  // 3. QUICK ANSWER
  if (type === 'QUICK_ANSWER') {
    baseSession.roundDurationSeconds = settings.timerSeconds ?? 0;
    baseSession.roundStatus = 'READY';
  }

  // 4. TEAM RACE
  if (type === 'TEAM_RACE') {
    const teamCount = settings.teamCount || 2;
    const teamPresets = [
      { name: 'Đội Mặt Trời ☀️', color: '#f59e0b' },
      { name: 'Đội Ngôi Sao ⭐', color: '#06b6d4' },
      { name: 'Đội Cầu Vồng 🌈', color: '#8b5cf6' },
      { name: 'Đội Sấm Chớp ⚡', color: '#ef4444' },
    ];

    const teams: Record<string, TeamData> = {};
    const studentTeamMap: Record<string, string> = {};

    for (let i = 0; i < teamCount; i++) {
      const tId = `team-${i + 1}`;
      const preset = teamPresets[i % teamPresets.length];
      teams[tId] = {
        id: tId,
        name: settings.teamNames?.[i]?.trim() || preset.name,
        color: preset.color,
        memberIds: [],
        score: 0,
        displayOrder: i + 1,
      };
    }

    // Assign participants evenly to teams
    participants.forEach((p, idx) => {
      const teamKeys = Object.keys(teams);
      const assignedTeamId = teamKeys[idx % teamKeys.length];
      teams[assignedTeamId].memberIds.push(p.studentId);
      studentTeamMap[p.studentId] = assignedTeamId;
    });

    baseSession.teams = teams;
    baseSession.studentTeamMap = studentTeamMap;
  }

  // 5. KNOWLEDGE BOX
  if (type === 'KNOWLEDGE_BOX') {
    const boxCount = settings.boxCount || 6;
    const boxes: KnowledgeBoxItem[] = [];

    const boxTypes: Array<'QUESTION' | 'SPECIAL_ACTION'> = [
      'QUESTION',
      'SPECIAL_ACTION',
      'QUESTION',
      'SPECIAL_ACTION',
      'SPECIAL_ACTION',
      'QUESTION',
    ];

    for (let i = 1; i <= boxCount; i++) {
      const bType = boxTypes[(i - 1) % boxTypes.length];
      const qId = questionIds[boxes.filter(b=>b.type==='QUESTION').length];
      if(bType==='QUESTION'&&!qId)break;

      let title = `Hộp Quà ${i}`;
      let specialActionText = undefined;

      if (bType === 'SPECIAL_ACTION') {
        specialActionText = i%2===0?'Cả lớp dành một tràng vỗ tay cho sự cố gắng!':'Mời một bạn cùng giải thích cách làm. Không cộng điểm may mắn.';
        title = 'Hộp Quà Thử Thách';
      }

      boxes.push({
        id: i,
        type: bType,
        title,
        questionId: bType === 'QUESTION' ? qId : undefined,
        specialActionText,
        isOpened: false,
      });
    }

    baseSession.boxes = boxes;
  }

  return baseSession;
};
