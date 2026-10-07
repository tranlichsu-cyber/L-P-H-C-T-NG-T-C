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
    uid: 'admin-tranlichsu',
    displayName: 'Trần Lịch Sử',
    email: 'tranlichsu@gmail.com',
    role: 'SCHOOL_ADMIN',
    teamIds: [],
    status: 'ACTIVE',
    createdAt: '2026-10-07T13:00:00.000Z',
    updatedAt: '2026-10-07T13:00:00.000Z',
  },
];

export const INITIAL_TEAMS: SchoolTeam[] = [
  {
    id: 'team-1',
    name: 'Tổ Khối 4 & 5',
    leaderIds: [],
    memberIds: [],
    createdAt: '2026-09-01T08:30:00.000Z',
  },
  {
    id: 'team-2',
    name: 'Tổ Khối 1, 2 & 3',
    leaderIds: [],
    memberIds: [],
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

export const INITIAL_JOIN_REQUESTS: SchoolJoinRequest[] = [];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];
