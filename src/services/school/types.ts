export type UserRole = 'SCHOOL_ADMIN' | 'TEAM_LEADER' | 'TEACHER';
export type MemberStatus = 'ACTIVE' | 'DISABLED' | 'INVITED';

// 1. Single School User Profile (users/{uid})
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  teamIds: string[];
  status: MemberStatus;
  createdAt: string;
  updatedAt: string;
}

// Backward compatibility alias
export type SchoolMember = UserProfile;

// 2. Single School Settings (settings/school)
export interface SchoolSettings {
  schoolName: string;
  schoolYear: string;
  displayName: string;
  campusName?: string;
  defaultPoints?: number;
  supportThreshold?: number;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Backward compatibility alias
export interface School {
  id: string;
  name: string;
  code: string;
  status: 'ACTIVE' | 'DISABLED';
  academicYear?: string;
  logoUrl?: string;
  createdAt: string;
}

// 3. Single School Teams (teams/{teamId})
export interface SchoolTeam {
  id: string;
  name: string;
  leaderIds: string[];
  memberIds: string[];
  createdAt: string;
}

// 4. Single School Join Requests (joinRequests/{requestId})
export interface SchoolJoinRequest {
  id: string; // uid
  uid: string;
  displayName: string;
  email: string;
  requestedAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

// 5. Audit Log (auditLogs/{logId})
export interface AuditLogEntry {
  id: string;
  action:
    | 'ROLE_CHANGED'
    | 'MEMBER_DISABLED'
    | 'MEMBER_ACTIVATED'
    | 'TEAM_ASSIGNED'
    | 'JOIN_REQUEST_APPROVED'
    | 'TEACHER_ACCOUNT_CREATED'
    | 'TEAM_CREATED'
    | 'TEAM_DELETED'
    | 'SETTING_UPDATED';
  actorUid: string;
  actorName: string;
  targetUid: string;
  targetName: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface QuizVisibility {
  visibility: 'PRIVATE' | 'TEAM' | 'SCHOOL';
  teamId?: string;
}
