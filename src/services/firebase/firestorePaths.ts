export const FirestorePaths = {
  // Single School User Profiles
  users: () => 'users',
  userDoc: (uid: string) => `users/${uid}`,

  // Single School Settings
  settings: () => 'settings/school',

  // Single School Teams
  teams: () => 'teams',
  teamDoc: (teamId: string) => `teams/${teamId}`,

  // Single School Join Requests
  joinRequests: () => 'joinRequests',
  joinRequestDoc: (requestId: string) => `joinRequests/${requestId}`,

  // Single School Audit Logs
  auditLogs: () => 'auditLogs',
  auditLogDoc: (logId: string) => `auditLogs/${logId}`,

  // Class & Student paths
  classes: () => 'classes',
  classDoc: (classId: string) => `classes/${classId}`,
  students: (classId: string) => `classes/${classId}/students`,
  studentDoc: (classId: string, studentId: string) => `classes/${classId}/students/${studentId}`,

  // Quiz paths (Visibility: PRIVATE, TEAM, SCHOOL)
  quizzes: () => 'quizzes',
  quizDoc: (quizId: string) => `quizzes/${quizId}`,

  // Live Room paths
  rooms: () => 'rooms',
  roomDoc: (roomId: string) => `rooms/${roomId}`,
  roster: (roomId: string) => `rooms/${roomId}/roster`,
  participants: (roomId: string) => `rooms/${roomId}/participants`,
  participantDoc: (roomId: string, studentId: string) => `rooms/${roomId}/participants/${studentId}`,
  liveQuestions: (roomId: string) => `rooms/${roomId}/liveQuestions`,
  liveQuestionDoc: (roomId: string, questionId: string) => `rooms/${roomId}/liveQuestions/${questionId}`,
  submissions: (roomId: string) => `rooms/${roomId}/submissions`,
  scores: (roomId: string) => `rooms/${roomId}/scores`,
  games: (roomId: string) => `rooms/${roomId}/games`,
  summary: (roomId: string) => `rooms/${roomId}/summary/main`,

  // Self-Paced Practice & History
  practiceSets: () => 'practiceSets',
  history: () => 'history',
  pilotFeedback: () => 'pilotFeedback',
};
