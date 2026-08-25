import { UserRole, VehicleStatus, ChecklistItem, ChecklistResponse } from '@autoprime/types';

export function calculatePdiProgress(totalItems: number, answeredItems: number): number {
  if (totalItems === 0) return 0;
  const pct = (answeredItems / totalItems) * 100;
  return Math.min(100, Math.round(pct * 100) / 100);
}

export function validateMandatoryChecklist(
  items: ChecklistItem[],
  responses: ChecklistResponse[]
): { isValid: boolean; missingItemCodes: string[] } {
  const answeredMap = new Set(responses.map((r) => r.itemId));
  const missing: string[] = [];

  for (const item of items) {
    if (item.isMandatory && !answeredMap.has(item.id)) {
      missing.push(item.itemCode);
    }
  }

  return {
    isValid: missing.length === 0,
    missingItemCodes: missing,
  };
}

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

  return true;
}
