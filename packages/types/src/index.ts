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

export type BookingStatus = 
  | 'BOOKED'
  | 'ALLOCATED'
  | 'PDI_READY'
  | 'INVOICED'
  | 'DELIVERED'
  | 'CANCELLED';

export type AssignmentStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REASSIGNED' | 'CANCELLED';
export type ResponseType = 'PASS_FAIL' | 'NUMERIC' | 'TEXT' | 'PHOTO_REQUIRED' | 'BOOLEAN' | 'MULTI_SELECT';
export type SeverityLevel = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'OBSERVATION';
export type PdiSessionStatus = 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

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

/**
 * 34-Field Authoritative Enterprise Booking Format (Hyundai & Tata)
 */
export interface Booking {
  id: string;
  organizationId: string;
  branchId?: string | null;
  receiptDate?: string | null;
  receiptNo: string;
  customerName: string;
  mobileNumber: string;
  salesConsultant?: string | null;
  teamLeader?: string | null;
  model: string;
  variant: string;
  colour: string;
  bookingDate?: string | null;
  bookingModel?: string | null;
  bookingVariant?: string | null;
  bookingColour?: string | null;
  bookingApprovalDate?: string | null;
  promiseDeliveryDate?: string | null;
  allocationDate?: string | null;
  allocatedModel?: string | null;
  allocatedVariant?: string | null;
  allocatedColour?: string | null;
  allocatedVinNo?: string | null;
  requisitionSlip?: string | null;
  requisitionDate?: string | null;
  issueNo?: string | null;
  issueDate?: string | null;
  prechallanDate?: string | null;
  prechallanNo?: string | null;
  challanApprovalDate?: string | null;
  insuranceDate?: string | null;
  afterInsuranceDate?: string | null;
  cancelDate?: string | null;
  reason?: string | null;
  receiptAmt?: number | null;
  docketNo?: string | null;
  panNo?: string | null;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  vehicle?: Vehicle | null;
}

/**
 * 21-Field Authoritative Stock / Vehicle Format (Hyundai & Tata)
 */
export interface Vehicle {
  id: string;
  organizationId: string;
  branchId: string;
  stockyardId?: string | null;
  vin: string;
  chassisNumber?: string;
  engineNumber?: string | null;
  model: string;
  variant: string;
  color: string;
  fuelType?: string;
  transmission?: string;
  manufacturingYear?: number;
  status: VehicleStatus;
  receivedAt?: string;
  
  // Extended Stock Fields
  purchaseDate?: string | null;
  fscCode?: string | null;
  dealerCode?: string | null;
  plantCode?: string | null;
  year?: number | null;
  quantity?: number;
  location?: string | null;
  customerName?: string | null;
  salesConsultant?: string | null;
  accessoriesAmount?: number;
  deliveryDate?: string | null;
  allocationDate?: string | null;
  allocatedDays?: number;
  receivedAmount?: number;

  createdAt: string;
  updatedAt: string;
}

export interface ChecklistTemplate {
  id: string;
  organizationId: string;
  name: string;
  modelPattern: string;
  fuelType: string;
  transmission: string;
  version: number;
  isActive: boolean;
  categories?: ChecklistCategory[];
}

export interface ChecklistCategory {
  id: string;
  templateId: string;
  code: string;
  name: string;
  description?: string;
  displayOrder: number;
  items?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  categoryId: string;
  itemCode: string;
  title: string;
  instructions?: string;
  responseType: ResponseType;
  isMandatory: boolean;
  evidenceRequired: boolean;
  failureSeverity: SeverityLevel;
  displayOrder: number;
  isActive: boolean;
}

export interface PdiSession {
  id: string;
  vehicleId: string;
  templateId: string;
  inspectorId: string;
  branchId: string;
  status: PdiSessionStatus;
  progressPercentage: number;
  totalItems: number;
  passedItems: number;
  failedItems: number;
  naItems: number;
  startedAt: string;
  submittedAt?: string | null;
  approvedAt?: string | null;
  notes?: string | null;
  vehicle?: Vehicle;
  responses?: ChecklistResponse[];
}

export interface ChecklistResponse {
  id: string;
  sessionId: string;
  itemId: string;
  status: 'PASS' | 'FAIL' | 'NA';
  numericValue?: number | null;
  textValue?: string | null;
  remarks?: string | null;
  mediaCount: number;
  respondedAt: string;
  item?: ChecklistItem;
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