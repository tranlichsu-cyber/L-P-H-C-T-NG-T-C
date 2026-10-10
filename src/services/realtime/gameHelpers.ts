import type { GameType, GameSessionData, TeamData, MysteryDoorItem, KnowledgeBoxItem } from './types';

export const buildInitialGameSession = (
  roomId: string,
  type: GameType,
  settings: GameSessionData['settings'],
  questionIds: string[],
  participants: { studentId: string; name: string }[]
): GameSessionData => {
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
    activeQuestionId: questionIds[0] || null,
  };

  // 1. RANDOM WHEEL
  if (type === 'RANDOM_WHEEL') {
    baseSession.calledStudentIds = [];
  }

  // 2. MYSTERY DOOR
  if (type === 'MYSTERY_DOOR') {
    const doorCount = settings.doorCount || 6;
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
    baseSession.roundDurationSeconds = settings.timerSeconds || 15;
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

    const boxTypes: Array<'QUESTION' | 'BONUS_POINTS' | 'SPECIAL_ACTION'> = [
      'QUESTION',
      'BONUS_POINTS',
      'QUESTION',
      'BONUS_POINTS',
      'SPECIAL_ACTION',
      'QUESTION',
    ];

    for (let i = 1; i <= boxCount; i++) {
      const bType = boxTypes[(i - 1) % boxTypes.length];
      const qId = questionIds[(i - 1) % Math.max(1, questionIds.length)] || 'q1';

      let title = `Hộp Quà ${i}`;
      let bonusPoints = undefined;
      let specialActionText = undefined;

      if (bType === 'BONUS_POINTS') {
        bonusPoints = i % 2 === 0 ? 10 : 5;
        title = `Hộp Quà May Mắn +${bonusPoints} điểm`;
      } else if (bType === 'SPECIAL_ACTION') {
        specialActionText = 'Mời một bạn trả lời câu hỏi!';
        title = 'Hộp Quà Thử Thách';
      }

      boxes.push({
        id: i,
        type: bType,
        title,
        questionId: bType === 'QUESTION' ? qId : undefined,
        bonusPoints,
        specialActionText,
        isOpened: false,
      });
    }

    baseSession.boxes = boxes;
  }

  return baseSession;
};
