import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type {
  School,
  SchoolSettings,
  UserProfile,
  SchoolTeam,
  SchoolJoinRequest,
  AuditLogEntry,
  UserRole,
  MemberStatus,
} from './types';
import {
  INITIAL_SCHOOL_SETTINGS,
  INITIAL_MEMBERS,
  INITIAL_TEAMS,
  INITIAL_JOIN_REQUESTS,
  INITIAL_AUDIT_LOGS,
} from './mockSchoolData';

const LOCAL_SCHOOL_KEY = 'lhtt_single_school_data';

interface LocalSchoolStorage {
  settings: SchoolSettings;
  users: UserProfile[];
  teams: SchoolTeam[];
  joinRequests: SchoolJoinRequest[];
  auditLogs: AuditLogEntry[];
}

export class SchoolService {
  private static loadLocalStorage(): LocalSchoolStorage {
    try {
      const raw = localStorage.getItem(LOCAL_SCHOOL_KEY);
      if (!raw) {
        const initial: LocalSchoolStorage = {
          settings: INITIAL_SCHOOL_SETTINGS,
          users: INITIAL_MEMBERS,
          teams: INITIAL_TEAMS,
          joinRequests: INITIAL_JOIN_REQUESTS,
          auditLogs: INITIAL_AUDIT_LOGS,
        };
        localStorage.setItem(LOCAL_SCHOOL_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(raw);
    } catch {
      return {
        settings: INITIAL_SCHOOL_SETTINGS,
        users: INITIAL_MEMBERS,
        teams: INITIAL_TEAMS,
        joinRequests: INITIAL_JOIN_REQUESTS,
        auditLogs: INITIAL_AUDIT_LOGS,
      };
    }
  }

  private static saveLocalStorage(data: LocalSchoolStorage): void {
    try {
      localStorage.setItem(LOCAL_SCHOOL_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save school storage to localStorage', err);
    }
  }

  // 1. Get Single School Settings (settings/school)
  public static async getSchoolSettings(): Promise<SchoolSettings> {
    if (db) {
      try {
        const sRef = doc(db, 'settings', 'school');
        const snap = await getDoc(sRef);
        if (snap.exists()) return snap.data() as SchoolSettings;
      } catch {}
    }
    const local = this.loadLocalStorage();
    return local.settings;
  }

  // Backward compatibility method
  public static async getSchool(): Promise<School> {
    const s = await this.getSchoolSettings();
    return {
      id: 'school-default',
      name: s.schoolName,
      code: 'SC2026',
      status: 'ACTIVE',
      academicYear: s.schoolYear,
      createdAt: s.createdAt,
    };
  }

  // 2. Get Users (users/{uid})
  public static async getUsers(): Promise<UserProfile[]> {
    if (db) {
      try {
        const uSnap = await getDocs(collection(db, 'users'));
        if (!uSnap.empty) {
          return uSnap.docs.map((d) => d.data() as UserProfile);
        }
      } catch {}
    }
    const local = this.loadLocalStorage();
    return local.users;
  }

  // Backward compatibility alias
  public static async getMembers(): Promise<UserProfile[]> {
    return this.getUsers();
  }

  // 3. Get User Profile
  public static async getUser(uid: string): Promise<UserProfile | null> {
    if (db) {
      try {
        const uRef = doc(db, 'users', uid);
        const snap = await getDoc(uRef);
        if (snap.exists()) return snap.data() as UserProfile;
      } catch {}
    }
    const local = this.loadLocalStorage();
    return local.users.find((u) => u.uid === uid) || null;
  }

  // 4. Update Member Role (with Last Admin Protection!)
  public static async updateMemberRole(
    targetUid: string,
    newRole: UserRole,
    actor: { uid: string; name: string },
    _deprecatedSchoolId?: string
  ): Promise<{ success: boolean; error?: string }> {
    const users = await this.getUsers();
    const target = users.find((u) => u.uid === targetUid);
    if (!target) return { success: false, error: 'Không tìm thấy giáo viên.' };

    // Last Admin Protection Check
    if (target.role === 'SCHOOL_ADMIN' && newRole !== 'SCHOOL_ADMIN') {
      const activeAdmins = users.filter(
        (u) => u.role === 'SCHOOL_ADMIN' && u.status === 'ACTIVE'
      );
      if (activeAdmins.length <= 1) {
        return {
          success: false,
          error: 'Không thể hạ quyền Admin này vì trường phải có ít nhất 1 Quản trị viên hoạt động!',
        };
      }
    }

    const oldRole = target.role;
    target.role = newRole;
    target.updatedAt = new Date().toISOString();

    if (db) {
      try {
        const uRef = doc(db, 'users', targetUid);
        await updateDoc(uRef, { role: newRole, updatedAt: target.updatedAt });
      } catch {}
    }

    const local = this.loadLocalStorage();
    const localIdx = local.users.findIndex((u) => u.uid === targetUid);
    if (localIdx !== -1) {
      local.users[localIdx].role = newRole;
      local.users[localIdx].updatedAt = target.updatedAt;
    }

    await this.logAuditEvent('ROLE_CHANGED', actor, targetUid, target.displayName, {
      oldRole,
      newRole,
    });

    this.saveLocalStorage(local);
    return { success: true };
  }

  // 5. Update Member Status (Disable / Activate with Last Admin Protection!)
  public static async updateMemberStatus(
    targetUid: string,
    status: MemberStatus,
    actor: { uid: string; name: string },
    _deprecatedSchoolId?: string
  ): Promise<{ success: boolean; error?: string }> {
    const users = await this.getUsers();
    const target = users.find((u) => u.uid === targetUid);
    if (!target) return { success: false, error: 'Không tìm thấy giáo viên.' };

    // Last Admin Protection Check
    if (target.role === 'SCHOOL_ADMIN' && status === 'DISABLED') {
      const activeAdmins = users.filter(
        (u) => u.role === 'SCHOOL_ADMIN' && u.status === 'ACTIVE'
      );
      if (activeAdmins.length <= 1) {
        return {
          success: false,
          error: 'Không thể khóa tài khoản Admin này vì trường phải có ít nhất 1 Quản trị viên hoạt động!',
        };
      }
    }

    target.status = status;
    target.updatedAt = new Date().toISOString();

    if (db) {
      try {
        const uRef = doc(db, 'users', targetUid);
        await updateDoc(uRef, { status, updatedAt: target.updatedAt });
      } catch {}
    }

    const local = this.loadLocalStorage();
    const localIdx = local.users.findIndex((u) => u.uid === targetUid);
    if (localIdx !== -1) {
      local.users[localIdx].status = status;
      local.users[localIdx].updatedAt = target.updatedAt;
    }

    const action = status === 'DISABLED' ? 'MEMBER_DISABLED' : 'MEMBER_ACTIVATED';
    await this.logAuditEvent(action, actor, targetUid, target.displayName, { status });

    this.saveLocalStorage(local);
    return { success: true };
  }

  // 6. Update Member Team Assignment
  public static async updateMemberTeams(
    targetUid: string,
    teamIds: string[],
    actor: { uid: string; name: string },
    _deprecatedSchoolId?: string
  ): Promise<boolean> {
    const users = await this.getUsers();
    const target = users.find((u) => u.uid === targetUid);
    if (!target) return false;

    target.teamIds = teamIds;
    target.updatedAt = new Date().toISOString();

    if (db) {
      try {
        const uRef = doc(db, 'users', targetUid);
        await updateDoc(uRef, { teamIds, updatedAt: target.updatedAt });
      } catch {}
    }

    const local = this.loadLocalStorage();
    const localIdx = local.users.findIndex((u) => u.uid === targetUid);
    if (localIdx !== -1) {
      local.users[localIdx].teamIds = teamIds;
      local.users[localIdx].updatedAt = target.updatedAt;
    }

    await this.logAuditEvent('TEAM_ASSIGNED', actor, targetUid, target.displayName, { teamIds });

    this.saveLocalStorage(local);
    return true;
  }

  // 7. Get Teams (teams/{teamId})
  public static async getTeams(): Promise<SchoolTeam[]> {
    if (db) {
      try {
        const tSnap = await getDocs(collection(db, 'teams'));
        if (!tSnap.empty) {
          return tSnap.docs.map((d) => d.data() as SchoolTeam);
        }
      } catch {}
    }
    const local = this.loadLocalStorage();
    return local.teams;
  }

  // 8. Create Team
  public static async createTeam(
    name: string,
    leaderIds: string[],
    memberIds: string[],
    _deprecatedSchoolId?: string
  ): Promise<SchoolTeam> {
    const teamId = `team-${Date.now()}`;
    const newTeam: SchoolTeam = {
      id: teamId,
      name: name.trim(),
      leaderIds,
      memberIds,
      createdAt: new Date().toISOString(),
    };

    if (db) {
      try {
        const tRef = doc(db, 'teams', teamId);
        await setDoc(tRef, newTeam);
      } catch {}
    }

    const local = this.loadLocalStorage();
    local.teams.push(newTeam);
    this.saveLocalStorage(local);

    return newTeam;
  }

  // 9. Get Join Requests (joinRequests/{requestId})
  public static async getJoinRequests(): Promise<SchoolJoinRequest[]> {
    if (db) {
      try {
        const rSnap = await getDocs(collection(db, 'joinRequests'));
        if (!rSnap.empty) {
          return rSnap.docs.map((d) => d.data() as SchoolJoinRequest);
        }
      } catch {}
    }
    const local = this.loadLocalStorage();
    return local.joinRequests;
  }

  // 10. Approve Join Request
  public static async approveJoinRequest(
    requestId: string,
    actor: { uid: string; name: string },
    _deprecatedSchoolId?: string
  ): Promise<boolean> {
    const local = this.loadLocalStorage();
    const req = local.joinRequests.find((r) => r.id === requestId);
    if (!req) return false;

    req.status = 'ACCEPTED';

    const newUser: UserProfile = {
      uid: req.uid,
      displayName: req.displayName,
      email: req.email,
      role: 'TEACHER',
      teamIds: [],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    local.users.push(newUser);

    if (db) {
      try {
        const reqRef = doc(db, 'joinRequests', requestId);
        const uRef = doc(db, 'users', req.uid);
        await updateDoc(reqRef, { status: 'ACCEPTED' });
        await setDoc(uRef, newUser);
      } catch {}
    }

    await this.logAuditEvent('JOIN_REQUEST_APPROVED', actor, req.uid, req.displayName, { email: req.email });

    this.saveLocalStorage(local);
    return true;
  }

  // 11. Audit Logs (auditLogs/{logId})
  public static async getAuditLogs(): Promise<AuditLogEntry[]> {
    if (db) {
      try {
        const lSnap = await getDocs(collection(db, 'auditLogs'));
        if (!lSnap.empty) {
          return lSnap.docs.map((d) => d.data() as AuditLogEntry);
        }
      } catch {}
    }
    const local = this.loadLocalStorage();
    return local.auditLogs;
  }

  public static async logAuditEvent(
    action: AuditLogEntry['action'],
    actor: { uid: string; name: string },
    targetUid: string,
    targetName: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const logId = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const entry: AuditLogEntry = {
      id: logId,
      action,
      actorUid: actor.uid,
      actorName: actor.name,
      targetUid,
      targetName,
      metadata,
      createdAt: new Date().toISOString(),
    };

    if (db) {
      try {
        const lRef = doc(db, 'auditLogs', logId);
        await setDoc(lRef, entry);
      } catch {}
    }

    const local = this.loadLocalStorage();
    local.auditLogs.unshift(entry);
    this.saveLocalStorage(local);
  }

  // 12. Single School Dashboard Metrics
  public static async getSchoolDashboardMetrics(): Promise<{
    activeTeacherCount: number;
    totalClassesCount: number;
    totalStudentsCount: number;
    monthlyRoomsCount: number;
    sharedQuizCount: number;
  }> {
    const users = await this.getUsers();
    const activeTeacherCount = users.filter((u) => u.status === 'ACTIVE').length;

    return {
      activeTeacherCount,
      totalClassesCount: 12,
      totalStudentsCount: 380,
      monthlyRoomsCount: 45,
      sharedQuizCount: 24,
    };
  }
}
