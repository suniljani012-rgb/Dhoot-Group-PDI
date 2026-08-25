import { z } from 'zod';

export const ResponseStatusSchema = z.enum(['PASS', 'FAIL', 'NA']);

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

export const VinSchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(17, 'VIN must be exactly 17 alphanumeric characters')
  .regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'VIN cannot contain letters I, O, or Q (ISO 3779 standard)');
