import React from 'react';
import { Navigate } from 'react-router-dom';
import type { UserRole } from '../../services/school/types';

interface RoleGuardProps {
  children: React.ReactElement;
  allowedRoles: UserRole[];
  currentRole: UserRole;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles, currentRole }) => {
  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to="/teacher" replace />;
  }
  return children;
};
