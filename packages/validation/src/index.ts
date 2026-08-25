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

export const UpdateUserSchema = CreateUserSchema.partial().omit({ organizationId: true });

export const RegisterDeviceSchema = z.object({
  deviceFingerprint: z.string().min(10),
  platform: z.enum(['IOS', 'ANDROID']),
  osVersion: z.string().min(1),
  appVersion: z.string().min(1),
  pushToken: z.string().optional(),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  branchId: z.string().uuid().optional(),
  role: UserRoleSchema.optional(),
});
