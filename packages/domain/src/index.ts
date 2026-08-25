import { UserRole, VehicleStatus } from '@autoprime/types';

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

// Strict 13-state vehicle state machine transitions
export const ALLOWED_TRANSITIONS: Record<VehicleStatus, VehicleStatus[]> = {
  RECEIVED: ['PDI_PENDING'],
  PDI_PENDING: ['PDI_IN_PROGRESS', 'PDI_PENDING'],
  PDI_IN_PROGRESS: ['QA_PENDING', 'PDI_FAILED'],
  PDI_FAILED: ['REPAIR_PENDING'],
  REPAIR_PENDING: ['REPAIR_IN_PROGRESS'],
  REPAIR_IN_PROGRESS: ['REPAIR_COMPLETED'],
  REPAIR_COMPLETED: ['REINSPECTION'],
  REINSPECTION: ['QA_PENDING', 'PDI_FAILED'],
  QA_PENDING: ['PDI_APPROVED', 'QA_REJECTED'],
  QA_REJECTED: ['REINSPECTION', 'REPAIR_PENDING'],
  PDI_APPROVED: ['DELIVERY_READY'],
  DELIVERY_READY: ['DELIVERED'],
  DELIVERED: [],
};

export function isValidVehicleTransition(
  fromStatus: VehicleStatus,
  toStatus: VehicleStatus,
  userRole: UserRole
): boolean {
  if (userRole === 'SUPER_ADMIN') return true;

  const validNext = ALLOWED_TRANSITIONS[fromStatus];
  if (!validNext || !validNext.includes(toStatus)) {
    return false;
  }

  // Role permissions per transition
  switch (toStatus) {
    case 'PDI_PENDING':
      return ['HO_ADMIN', 'BRANCH_MANAGER'].includes(userRole);
    case 'PDI_IN_PROGRESS':
    case 'QA_PENDING':
    case 'PDI_FAILED':
      return ['PDI_ENGINEER', 'BRANCH_MANAGER'].includes(userRole);
    case 'REPAIR_PENDING':
    case 'REPAIR_IN_PROGRESS':
    case 'REPAIR_COMPLETED':
      return ['WORKSHOP_MANAGER', 'TECHNICIAN', 'BRANCH_MANAGER'].includes(userRole);
    case 'REINSPECTION':
      return ['PDI_ENGINEER', 'QA_MANAGER', 'BRANCH_MANAGER'].includes(userRole);
    case 'PDI_APPROVED':
    case 'QA_REJECTED':
      return ['QA_MANAGER', 'HO_ADMIN'].includes(userRole);
    case 'DELIVERY_READY':
    case 'DELIVERED':
      return ['BRANCH_MANAGER', 'HO_ADMIN'].includes(userRole);
    default:
      return false;
  }
}

export function hasMinimumRole(userRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[targetRole];
}

export function canManageUsers(userRole: UserRole): boolean {
  return ['SUPER_ADMIN', 'HO_ADMIN', 'BRANCH_MANAGER'].includes(userRole);
}

export function canApproveQA(userRole: UserRole): boolean {
  return ['SUPER_ADMIN', 'HO_ADMIN', 'QA_MANAGER'].includes(userRole);
}
