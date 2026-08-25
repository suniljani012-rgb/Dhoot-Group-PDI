import { z } from 'zod';

export const UserRoleSchema = z.enum([
  'SUPER_ADMIN',
  'HO_ADMIN',
  'REGIONAL_MANAGER',
  'BRANCH_MANAGER',
  'PDI_ENGINEER',
  'WORKSHOP_MANAGER',
  'TECHNICIAN',
  'QA_MANAGER',
  'VIEWER',
]);

export const VehicleStatusSchema = z.enum([
  'RECEIVED',
  'PDI_PENDING',
  'PDI_IN_PROGRESS',
  'PDI_FAILED',
  'REPAIR_PENDING',
  'REPAIR_IN_PROGRESS',
  'REPAIR_COMPLETED',
  'REINSPECTION',
  'QA_PENDING',
  'QA_REJECTED',
  'PDI_APPROVED',
  'DELIVERY_READY',
  'DELIVERED',
]);

export const ResponseStatusSchema = z.enum(['PASS', 'FAIL', 'NA']);

export const VinSchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(17, 'VIN must be exactly 17 alphanumeric characters')
  .regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'VIN cannot contain letters I, O, or Q (ISO 3779 standard)');

export const LoginRequestSchema = z.object({
  employeeId: z.string().min(3, 'Employee ID must be at least 3 characters').max(50),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  deviceFingerprint: z.string().optional(),
  platform: z.enum(['IOS', 'ANDROID', 'WEB']).default('WEB'),
  osVersion: z.string().optional(),
  appVersion: z.string().optional(),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const CreateUserSchema = z.object({
  employeeId: z.string().min(3).max(50),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  role: UserRoleSchema,
  branchId: z.string().uuid('Invalid branch ID').optional(),
  organizationId: z.string().uuid('Invalid organization ID'),
});

export const CreateVehicleSchema = z.object({
  vin: VinSchema,
  chassisNumber: z.string().min(3).max(50),
  engineNumber: z.string().max(50).optional(),
  model: z.string().min(1, 'Model is required'),
  variant: z.string().min(1, 'Variant is required'),
  fuelType: z.enum(['PETROL', 'DIESEL', 'CNG', 'EV', 'HYBRID']),
  transmission: z.enum(['MANUAL', 'AUTOMATIC', 'AMT', 'DCA', 'EV_SINGLE_SPEED']),
  color: z.string().min(1, 'Color is required'),
  manufacturingYear: z.number().int().min(2020).max(2030),
  stockyardId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
});

export const TransitionVehicleStatusSchema = z.object({
  toStatus: VehicleStatusSchema,
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export const CreateAssignmentSchema = z.object({
  vehicleId: z.string().uuid(),
  assignedTo: z.string().uuid(),
  dueAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const SingleResponseSchema = z.object({
  itemId: z.string().uuid(),
  status: ResponseStatusSchema,
  numericValue: z.number().optional().nullable(),
  textValue: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export const BatchSaveResponsesSchema = z.object({
  responses: z.array(SingleResponseSchema).min(1),
});

export const SubmitPdiSessionSchema = z.object({
  notes: z.string().optional(),
});

export const CreatePdiSessionSchema = z.object({
  vehicleId: z.string().uuid(),
  templateId: z.string().uuid().optional(),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  branchId: z.string().uuid().optional(),
  status: VehicleStatusSchema.optional(),
  model: z.string().optional(),
});
