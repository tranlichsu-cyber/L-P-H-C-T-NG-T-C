import type { School, SchoolSettings, UserProfile, SchoolTeam, SchoolJoinRequest, AuditLogEntry } from './types';

export const INITIAL_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: 'Trường Tiểu học Sông Công',
  schoolYear: '2026-2027',
  displayName: 'Trường TH Sông Công',
  campusName: 'Phân hiệu Lý Tự Trọng',
  defaultPoints: 5,
  supportThreshold: 60,
  createdAt: '2026-09-01T08:00:00.000Z',
  updatedAt: '2026-10-06T10:00:00.000Z',
};

export const INITIAL_SCHOOL: School = {
  id: 'school-default',
  name: 'Trường Tiểu học Sông Công',
  code: 'SC2026',
  status: 'ACTIVE',
  academicYear: '2026-2027',
  createdAt: '2026-09-01T08:00:00.000Z',
};

export const INITIAL_MEMBERS: UserProfile[] = [
  {
    uid: 'teacher-1',
    displayName: 'Cô Nguyễn Thị Hương',
    email: 'huong.nguyen@nguyentrai.edu.vn',
    role: 'SCHOOL_ADMIN',
    teamIds: ['team-2'],
    status: 'ACTIVE',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-06T10:00:00.000Z',
  },
  {
    uid: 'teacher-2',
    displayName: 'Thầy Trần Văn Minh',
    email: 'minh.tran@nguyentrai.edu.vn',
    role: 'TEAM_LEADER',
    teamIds: ['team-1'],
    status: 'ACTIVE',
    createdAt: '2026-09-02T09:00:00.000Z',
    updatedAt: '2026-10-05T14:00:00.000Z',
  },
  {
    uid: 'teacher-3',
    displayName: 'Cô Lê Thu Hà',
    email: 'ha.le@nguyentrai.edu.vn',
    role: 'TEACHER',
    teamIds: ['team-1'],
    status: 'ACTIVE',
    createdAt: '2026-09-03T10:30:00.000Z',
    updatedAt: '2026-10-04T11:00:00.000Z',
  },
  {
    uid: 'teacher-4',
    displayName: 'Thầy Phạm Hoàng Nam',
    email: 'nam.pham@nguyentrai.edu.vn',
    role: 'TEACHER',
    teamIds: ['team-2'],
    status: 'DISABLED',
    createdAt: '2026-09-05T11:00:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
  },
];

export const INITIAL_TEAMS: SchoolTeam[] = [
  {
    id: 'team-1',
    name: 'Tổ Khối 4 & 5',
    leaderIds: ['teacher-2'],
    memberIds: ['teacher-2', 'teacher-3'],
    createdAt: '2026-09-01T08:30:00.000Z',
  },
  {
    id: 'team-2',
    name: 'Tổ Khối 1, 2 & 3',
    leaderIds: ['teacher-1'],
    memberIds: ['teacher-1', 'teacher-4'],
    createdAt: '2026-09-01T08:30:00.000Z',
  },
  {
    id: 'team-3',
    name: 'Tổ Tin học & Công nghệ',
    leaderIds: [],
    memberIds: [],
    createdAt: '2026-09-01T08:30:00.000Z',
  },
];

export const INITIAL_JOIN_REQUESTS: SchoolJoinRequest[] = [
  {
    id: 'req-101',
    uid: 'req-101',
    displayName: 'Cô Vũ Hải Yến',
    email: 'yen.vu@nguyentrai.edu.vn',
    status: 'PENDING',
    requestedAt: '2026-10-06T15:30:00.000Z',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    action: 'ROLE_CHANGED',
    actorUid: 'teacher-1',
    actorName: 'Cô Nguyễn Thị Hương',
    targetUid: 'teacher-2',
    targetName: 'Thầy Trần Văn Minh',
    metadata: { oldRole: 'TEACHER', newRole: 'TEAM_LEADER' },
    createdAt: '2026-10-05T14:00:00.000Z',
  },
  {
    id: 'log-2',
    action: 'MEMBER_DISABLED',
    actorUid: 'teacher-1',
    actorName: 'Cô Nguyễn Thị Hương',
    targetUid: 'teacher-4',
    targetName: 'Thầy Phạm Hoàng Nam',
    metadata: { reason: 'Chuyển công tác' },
    createdAt: '2026-10-01T09:00:00.000Z',
  },
];
