export type UserRole = 
  | 'SUPER_ADMIN'
  | 'HO_ADMIN'
  | 'REGIONAL_MANAGER'
  | 'BRANCH_MANAGER'
  | 'PDI_ENGINEER'
  | 'WORKSHOP_MANAGER'
  | 'TECHNICIAN'
  | 'QA_MANAGER'
  | 'VIEWER';

export type DevicePlatform = 'IOS' | 'ANDROID' | 'WEB';
export type DeviceStatus = 'ACTIVE' | 'REVOKED' | 'PENDING';

export type VehicleStatus = 
  | 'RECEIVED'
  | 'PDI_PENDING'
  | 'PDI_IN_PROGRESS'
  | 'PDI_FAILED'
  | 'REPAIR_PENDING'
  | 'REPAIR_IN_PROGRESS'
  | 'REPAIR_COMPLETED'
  | 'REINSPECTION'
  | 'QA_PENDING'
  | 'QA_REJECTED'
  | 'PDI_APPROVED'
  | 'DELIVERY_READY'
  | 'DELIVERED';

export type AssignmentStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REASSIGNED' | 'CANCELLED';

export interface User {
  id: string;
  organizationId: string;
  branchId: string | null;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
}

export interface Branch {
  id: string;
  organizationId: string;
  zoneId: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string | null;
  email: string | null;
  isActive: boolean;
}

export interface Stockyard {
  id: string;
  branchId: string;
  name: string;
  code: string;
  capacity: number;
  isActive: boolean;
}

export interface Vehicle {
  id: string;
  organizationId: string;
  branchId: string;
  stockyardId?: string | null;
  vin: string;
  chassisNumber: string;
  engineNumber?: string | null;
  model: string;
  variant: string;
  fuelType: string;
  transmission: string;
  color: string;
  manufacturingYear: number;
  status: VehicleStatus;
  receivedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleStatusHistory {
  id: string;
  vehicleId: string;
  fromStatus: VehicleStatus | null;
  toStatus: VehicleStatus;
  changedBy: string;
  reason?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface PdiAssignment {
  id: string;
  vehicleId: string;
  assignedTo: string;
  assignedBy: string;
  status: AssignmentStatus;
  assignedAt: string;
  completedAt?: string | null;
  dueAt?: string | null;
  notes?: string | null;
  vehicle?: Vehicle;
  assignee?: User;
}

export interface Device {
  id: string;
  userId: string;
  deviceFingerprint: string;
  platform: DevicePlatform;
  osVersion: string;
  appVersion: string;
  pushToken?: string;
  status: DeviceStatus;
  lastActiveAt: string;
  registeredAt: string;
}

export interface SessionContext {
  userId: string;
  email: string;
  employeeId: string;
  role: UserRole;
  organizationId: string;
  branchId: string | null;
  sessionId: string;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    requestId: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    requestId: string;
  };
}
