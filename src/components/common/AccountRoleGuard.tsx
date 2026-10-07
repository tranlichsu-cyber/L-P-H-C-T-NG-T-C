import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SchoolService } from '../../services/school/SchoolService';
import type { UserProfile, UserRole } from '../../services/school/types';

interface AccountRoleGuardProps {
  children: React.ReactElement;
  allowedRoles: UserRole[];
}

export const AccountRoleGuard: React.FC<AccountRoleGuardProps> = ({ children, allowedRoles }) => {
  const { currentUser, authReady, isTeacherAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    if (!currentUser?.uid || currentUser.isAnonymous) {
      setProfile(null);
      return;
    }

    SchoolService.getUser(currentUser.uid)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.uid, currentUser?.isAnonymous]);

  if (!authReady) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 font-bold">
        Đang khôi phục phiên đăng nhập...
      </div>
    );
  }

  if (!isTeacherAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 font-bold">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  if (!profile || profile.status !== 'ACTIVE' || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/teacher" replace />;
  }

  return children;
};
