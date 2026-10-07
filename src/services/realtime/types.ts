import type { RoomStatus, QuestionStatus, QuestionType } from '../../types';

export type RealtimeEventType =
  | 'ROOM_UPDATED'
  | 'PARTICIPANT_JOINED'
  | 'PARTICIPANT_UPDATED'
  | 'QUESTION_OPENED'
  | 'QUESTION_CLOSED'
  | 'QUESTION_RESULT'
  | 'SUBMISSION_CREATED'
  | 'SCORE_UPDATED'
  | 'STUDENT_CALLED'
  | 'GAME_UPDATED'
  | 'GAME_STARTED'
  | 'GAME_PAUSED'
  | 'GAME_FINISHED'
  | 'ROOM_FINISHED';

export type GameType =
  | 'RANDOM_WHEEL'
  | 'MYSTERY_DOOR'
  | 'QUICK_ANSWER'
  | 'TEAM_RACE'
  | 'KNOWLEDGE_BOX';

export type GameStatus = 'READY' | 'RUNNING' | 'PAUSED' | 'FINISHED';

export interface TeamData {
  id: string;
  name: string;
  color: string;
  memberIds: string[];
  score: number;
  displayOrder: number;
}

export interface MysteryDoorItem {
  id: number;
  questionId: string;
  isOpened: boolean;
  openedByStudentId?: string;
  openedByStudentName?: string;
}

export interface KnowledgeBoxItem {
  id: number;
  type: 'QUESTION' | 'BONUS_POINTS' | 'SPECIAL_ACTION';
  title: string;
  questionId?: string;
  bonusPoints?: number;
  specialActionText?: string;
  isOpened: boolean;
  openedByStudentId?: string;
}

export interface GameSessionData {
  id: string;
  roomId: string;
  type: GameType;
  status: GameStatus;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  settings: {
    timerSeconds?: number; // 0 for off, 5, 10, 15, 20, 30
    enableSpeedScore?: boolean;
    showRanking?: boolean;
    fairnessUncalled?: boolean;
    soundEnabled?: boolean;
    doorCount?: number;
    boxCount?: number;
    teamCount?: number;
    teamScoringMode?: 'ACCURACY_RATE' | 'CORRECT_COUNT' | 'MANUAL';
  };
  currentRound: number;
  roundStartedAt?: string;
  roundDurationSeconds?: number;
  roundStatus?: 'READY' | 'OPEN' | 'CLOSED' | 'RESULT';
  activeQuestionId?: string | null;

  // Game specific payload state
  calledStudentIds?: string[];
  doors?: MysteryDoorItem[];
  boxes?: KnowledgeBoxItem[];
  teams?: Record<string, TeamData>; // teamId -> TeamData
  studentTeamMap?: Record<string, string>; // studentId -> teamId
}

export interface RealtimeEvent {
  type: RealtimeEventType;
  roomId: string;
  payload?: any;
  timestamp: string;
}

export interface MockRoomRosterItem {
  id: string;
  studentId: string;
  name: string;
}

export interface MockParticipant {
  studentId: string;
  name: string;
  mockAuthUid?: string;
  sessionToken: string;
  joinedAt: string;
  lastSeenAt: string;
}

export interface LiveQuestionPublic {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[];
  status: QuestionStatus;
  startedAt?: string;
  correctAnswer?: string; // Omitted until status === RESULT
  explanation?: string;   // Omitted until status === RESULT
}

export interface MockSubmission {
  id: string; // questionId_studentId
  questionId: string;
  studentId: string;
  studentName: string;
  mockAuthUid?: string;
  answer: string;
  isCorrect?: boolean;
  submittedAt: string;
}

export interface MockScore {
  studentId: string;
  studentName: string;
  score: number;
  totalScore?: number;
  updatedAt?: string;
}

export interface ScoreEvent {
  id: string; // question_q1_student_s1 or manual_<timestamp>_<rand> or game_<gameId>_<rand>
  studentId: string;
  type: 'QUESTION_CORRECT' | 'MANUAL' | 'GAME_CORRECT' | 'GAME_BONUS' | 'TEAM_GAME_REWARD';
  points: number;
  questionId?: string;
  reason?: string;
  createdAt: string;
  createdBy?: string;
}

export interface CalledStudentInfo {
  studentId: string;
  studentName: string;
  calledAt: string;
  reason?: string;
  callSequence: number;
}

export interface MockRoomData {
  id: string;
  roomCode: string;
  teacherId: string;
  classId: string;
  className: string;
  subject: string;
  grade?: string;
  quizId: string;
  quizTitle: string;
  status: RoomStatus;
  activeQuestionId: string | null;
  createdAt: string;
  finishedAt?: string;
  archived?: boolean;
  expiresAt: string;

  roster: MockRoomRosterItem[];
  participants: Record<string, MockParticipant>; // studentId -> Participant
  liveQuestions: Record<string, LiveQuestionPublic>; // questionId -> LiveQuestionPublic
  submissions: Record<string, MockSubmission>; // submissionId -> Submission
  scores: Record<string, MockScore>; // studentId -> MockScore
  scoreEvents: Record<string, ScoreEvent>; // eventId -> ScoreEvent
  calledStudent?: CalledStudentInfo | null;
  callHistory?: string[]; // studentIds already called in this room session

  activeGameId?: string | null;
  activeGame?: GameSessionData | null;
}

export interface CreateRoomParams {
  teacherId: string;
  classId: string;
  className: string;
  subject: string;
  quizId: string;
  quizTitle: string;
  questions: {
    id: string;
    type: QuestionType;
    content: string;
    options?: string[];
    correctAnswer: string;
    explanation?: string;
  }[];
  roster: { id: string; name: string }[];
}

export interface SubmitAnswerParams {
  roomId: string;
  questionId: string;
  studentId: string;
  studentName: string;
  mockAuthUid: string;
  answer: string;
}
