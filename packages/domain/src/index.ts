import { UserRole } from '@autoprime/types';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  HO_ADMIN: 90,
  REGIONAL_MANAGER: 70,
  BRANCH_MANAGER: 50,
  QA_MANAGER: 40,
  WORKSHOP_MANAGER: 30,
  PDI_ENGINEER: 20,
  TECHNICIAN: 20,
  VIEWER: 10,
};

export function hasMinimumRole(userRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[targetRole];
}

export function canManageUsers(userRole: UserRole): boolean {
  return ['SUPER_ADMIN', 'HO_ADMIN', 'BRANCH_MANAGER'].includes(userRole);
}

export function canApproveQA(userRole: UserRole): boolean {
  return ['SUPER_ADMIN', 'HO_ADMIN', 'QA_MANAGER'].includes(userRole);
}

export function canPerformPDI(userRole: UserRole): boolean {
  return userRole === 'PDI_ENGINEER';
}

export function isBranchScoped(userRole: UserRole): boolean {
  return [
    'BRANCH_MANAGER',
    'PDI_ENGINEER',
    'WORKSHOP_MANAGER',
    'TECHNICIAN',
    'QA_MANAGER',
    'VIEWER'
  ].includes(userRole);
}
