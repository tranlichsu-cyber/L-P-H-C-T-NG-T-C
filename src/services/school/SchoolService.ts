import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { deleteApp, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  inMemoryPersistence,
  setPersistence,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { db, firebaseConfig, isFirebaseConfigured } from '../firebase/firebase';
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

const normalizeSchoolSettings = (settings: SchoolSettings): SchoolSettings => {
  const isLegacyNguyenTrai =
    settings.schoolName?.includes('Nguyễn Trãi') ||
    settings.displayName?.includes('Nguyễn Trãi');

  if (!isLegacyNguyenTrai) return settings;

  return {
    ...settings,
    schoolName: 'Trường Tiểu học Sông Công',
    displayName: 'Trường TH Sông Công',
    campusName: 'Phân hiệu Lý Tự Trọng',
    updatedAt: new Date().toISOString(),
  };
};

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
      const parsed = JSON.parse(raw) as LocalSchoolStorage;
      const normalizedSettings = normalizeSchoolSettings(parsed.settings);
      const hasLegacySampleStaff = parsed.users?.some((u) =>
        ['teacher-1', 'teacher-2', 'teacher-3', 'teacher-4'].includes(u.uid) ||
        u.email?.includes('@nguyentrai.edu.vn')
      );
      const migrated: LocalSchoolStorage = {
        ...parsed,
        settings: normalizedSettings,
        users: hasLegacySampleStaff ? INITIAL_MEMBERS : parsed.users,
        joinRequests: hasLegacySampleStaff ? [] : parsed.joinRequests,
        auditLogs: hasLegacySampleStaff ? [] : parsed.auditLogs,
      };
      if (normalizedSettings !== parsed.settings || hasLegacySampleStaff) {
        localStorage.setItem(LOCAL_SCHOOL_KEY, JSON.stringify(migrated));
      }
      return migrated;
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

  private static settingsListeners: Array<(s: SchoolSettings) => void> = [];

  private static notifySettingsListeners(updated: SchoolSettings): void {
    this.settingsListeners.forEach((listener) => {
      try {
        listener(updated);
      } catch (err) {
        console.error('Error in settings listener:', err);
      }
    });
  }

  // 1. Get Single School Settings (settings/school)
  public static async getSchoolSettings(): Promise<SchoolSettings> {
    if (isFirebaseConfigured && db) {
      try {
        const sRef = doc(db, 'settings', 'school');
        const snap = await getDoc(sRef);
        if (snap.exists()) {
          const settings = snap.data() as SchoolSettings;
          const normalized = normalizeSchoolSettings(settings);
          if (normalized !== settings) {
            try {
              await updateDoc(sRef, {
                schoolName: normalized.schoolName,
                displayName: normalized.displayName,
                campusName: normalized.campusName,
                updatedAt: normalized.updatedAt,
              });
            } catch {}
          }
          return normalized;
        }
      } catch {}
    }
    const local = this.loadLocalStorage();
    return local.settings;
  }

  // Update School Settings (settings/school) & logoUrl
  public static async updateSchoolSettings(
    updates: Partial<SchoolSettings>,
    actor?: { uid: string; name: string }
  ): Promise<SchoolSettings> {
    const current = await this.getSchoolSettings();
    const updated: SchoolSettings = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      try {
        const sRef = doc(db, 'settings', 'school');
        await setDoc(sRef, updated, { merge: true });
      } catch (err) {
        console.error('Failed to save settings/school in Firestore:', err);
        throw new Error('Không thể lưu cấu hình trường lên Firestore. Vui lòng kiểm tra kết nối và quyền truy cập.');
      }
    }

    const local = this.loadLocalStorage();
    local.settings = updated;
    this.saveLocalStorage(local);

    this.notifySettingsListeners(updated);

    if (actor) {
      await this.logAuditEvent('SETTING_UPDATED', actor, 'settings/school', 'Cấu hình trường', updates);
    }

    return updated;
  }

  // Subscribe to real-time updates for settings/school
  public static subscribeSchoolSettings(
    callback: (settings: SchoolSettings) => void
  ): () => void {
    let firestoreUnsub: (() => void) | null = null;

    if (isFirebaseConfigured && db) {
      try {
        const sRef = doc(db, 'settings', 'school');
        firestoreUnsub = onSnapshot(
          sRef,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data() as SchoolSettings;
              const normalized = normalizeSchoolSettings(data);
              const local = SchoolService.loadLocalStorage();
              local.settings = normalized;
              SchoolService.saveLocalStorage(local);
              callback(normalized);
            }
          },
          (err) => {
            console.warn('onSnapshot warning for settings/school:', err);
          }
        );
      } catch (err) {
        console.warn('Failed to listen to settings/school via onSnapshot:', err);
      }
    }

    // Register local listener as well
    this.settingsListeners.push(callback);

    return () => {
      if (firestoreUnsub) {
        firestoreUnsub();
      }
      this.settingsListeners = this.settingsListeners.filter((l) => l !== callback);
    };
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
      logoUrl: s.logoUrl,
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

  // 3. Create Teacher Account by School Admin.
  // Password is used only by Firebase Authentication and is NEVER stored in Firestore/localStorage.
  public static async createTeacherAccount(
    displayName: string,
    email: string,
    password: string,
    teamIds: string[],
    actor: { uid: string; name: string }
  ): Promise<UserProfile> {
    const cleanName = displayName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) throw new Error('Vui lòng nhập họ và tên giáo viên.');
    if (!cleanEmail) throw new Error('Vui lòng nhập email giáo viên.');
    if (password.length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');

    let uid = `teacher-${Date.now()}`;

    if (isFirebaseConfigured && db) {
      const secondaryApp = initializeApp(
        firebaseConfig,
        `admin-create-teacher-${Date.now()}-${Math.random().toString(36).slice(2)}`
      );
      const secondaryAuth = getAuth(secondaryApp);
      let createdUser: Awaited<ReturnType<typeof createUserWithEmailAndPassword>>['user'] | null = null;

      try {
        await setPersistence(secondaryAuth, inMemoryPersistence);
        const credential = await createUserWithEmailAndPassword(
          secondaryAuth,
          cleanEmail,
          password
        );
        createdUser = credential.user;
        uid = credential.user.uid;
        await updateProfile(credential.user, { displayName: cleanName });

        const now = new Date().toISOString();
        const profile: UserProfile = {
          uid,
          displayName: cleanName,
          email: cleanEmail,
          role: 'TEACHER',
          teamIds,
          status: 'ACTIVE',
          createdAt: now,
          updatedAt: now,
        };

        try {
          await setDoc(doc(db, 'users', uid), profile);
        } catch (profileError) {
          // Roll back the just-created Firebase Auth account if its profile cannot be created.
          await deleteUser(credential.user).catch(() => undefined);
          throw profileError;
        }

        const local = this.loadLocalStorage();
        local.users = local.users.filter((u) => u.uid !== uid && u.email !== cleanEmail);
        local.users.push(profile);
        this.saveLocalStorage(local);

        await this.logAuditEvent(
          'TEACHER_ACCOUNT_CREATED',
          actor,
          uid,
          cleanName,
          { email: cleanEmail, teamIds }
        );

        return profile;
      } finally {
        if (createdUser && secondaryAuth.currentUser) {
          await signOut(secondaryAuth).catch(() => undefined);
        }
        await deleteApp(secondaryApp).catch(() => undefined);
      }
    }

    const now = new Date().toISOString();
    const profile: UserProfile = {
      uid,
      displayName: cleanName,
      email: cleanEmail,
      role: 'TEACHER',
      teamIds,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    const local = this.loadLocalStorage();
    local.users = local.users.filter((u) => u.email !== cleanEmail);
    local.users.push(profile);
    this.saveLocalStorage(local);
    await this.logAuditEvent('TEACHER_ACCOUNT_CREATED', actor, uid, cleanName, {
      email: cleanEmail,
      teamIds,
      mock: true,
    });
    return profile;
  }

  // 4. Get User Profile
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
    actor?: { uid: string; name: string },
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
      const tRef = doc(db, 'teams', teamId);
      await setDoc(tRef, newTeam);
    }

    const local = this.loadLocalStorage();
    local.teams.push(newTeam);
    this.saveLocalStorage(local);

    if (actor) {
      await this.logAuditEvent('TEAM_CREATED', actor, teamId, newTeam.name, {
        leaderIds,
        memberIds,
      });
    }

    return newTeam;
  }

  // 9. Delete Team
  public static async deleteTeam(
    teamId: string,
    actor: { uid: string; name: string }
  ): Promise<void> {
    const teams = await this.getTeams();
    const target = teams.find((t) => t.id === teamId);
    if (!target) throw new Error('Không tìm thấy tổ chuyên môn.');

    if (db) {
      const usersSnap = await getDocs(collection(db, 'users'));
      await Promise.all(
        usersSnap.docs.map(async (userDoc) => {
          const data = userDoc.data() as UserProfile;
          const currentTeamIds = data.teamIds || [];
          if (currentTeamIds.includes(teamId)) {
            await updateDoc(userDoc.ref, {
              teamIds: currentTeamIds.filter((id) => id !== teamId),
              updatedAt: new Date().toISOString(),
            });
          }
        })
      );
      await deleteDoc(doc(db, 'teams', teamId));
    }

    const local = this.loadLocalStorage();
    local.teams = local.teams.filter((t) => t.id !== teamId);
    local.users = local.users.map((u) => ({
      ...u,
      teamIds: (u.teamIds || []).filter((id) => id !== teamId),
      updatedAt: (u.teamIds || []).includes(teamId) ? new Date().toISOString() : u.updatedAt,
    }));
    this.saveLocalStorage(local);

    await this.logAuditEvent('TEAM_DELETED', actor, teamId, target.name, {
      formerLeaderIds: target.leaderIds,
    });
  }

  // 10. Get Join Requests (joinRequests/{requestId})
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

    if (!db) {
      return {
        activeTeacherCount,
        totalClassesCount: 0,
        totalStudentsCount: 0,
        monthlyRoomsCount: 0,
        sharedQuizCount: 0,
      };
    }

    const firestore = db;

    try {
      const legacyClassIds = new Set(['class-4a', 'class-4b', 'class-5a']);
      const legacyQuizIds = new Set(['quiz-1', 'quiz-2', 'quiz-3']);

      const [classesSnap, quizzesSnap, roomsSnap] = await Promise.all([
        getDocs(collection(firestore, 'classes')),
        getDocs(collection(firestore, 'quizzes')),
        getDocs(collection(firestore, 'rooms')),
      ]);

      const realClassDocs = classesSnap.docs.filter((d) => !legacyClassIds.has(d.id));
      const totalClassesCount = realClassDocs.length;

      const studentCounts = await Promise.all(
        realClassDocs.map(async (classDoc) => {
          const studentsSnap = await getDocs(collection(firestore, 'classes', classDoc.id, 'students'));
          return studentsSnap.size;
        })
      );
      const totalStudentsCount = studentCounts.reduce((sum, count) => sum + count, 0);

      const realQuizDocs = quizzesSnap.docs.filter((d) => !legacyQuizIds.has(d.id));
      const sharedQuizCount = realQuizDocs.filter((d) => {
        const data = d.data() as { visibility?: string };
        return data.visibility === 'TEAM' || data.visibility === 'SCHOOL';
      }).length;

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      const monthlyRoomsCount = roomsSnap.docs.filter((d) => {
        const data = d.data() as { createdAt?: unknown };
        const raw = data.createdAt;

        let created: Date | null = null;
        if (typeof raw === 'string') {
          const parsed = new Date(raw);
          if (!Number.isNaN(parsed.getTime())) created = parsed;
        } else if (raw && typeof (raw as { toDate?: () => Date }).toDate === 'function') {
          created = (raw as { toDate: () => Date }).toDate();
        }

        return Boolean(
          created &&
          created.getFullYear() === currentYear &&
          created.getMonth() === currentMonth
        );
      }).length;

      return {
        activeTeacherCount,
        totalClassesCount,
        totalStudentsCount,
        monthlyRoomsCount,
        sharedQuizCount,
      };
    } catch (error) {
      console.error('Không thể tải số liệu Dashboard cấp trường từ Firestore', error);
      return {
        activeTeacherCount,
        totalClassesCount: 0,
        totalStudentsCount: 0,
        monthlyRoomsCount: 0,
        sharedQuizCount: 0,
      };
    }
  }
}
