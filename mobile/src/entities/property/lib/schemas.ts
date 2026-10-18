import { z } from 'zod';

/** Client-side rules mirror the API validators (the server re-validates everything). */
export const propertySchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(200),
  address: z.string().trim().min(1, 'Address is required.').max(300),
  city: z.string().trim().min(1, 'City is required.').max(100),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;

export const unitSchema = z.object({
  unitNumber: z.string().trim().min(1, 'Unit number is required.').max(20),
  bedrooms: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Enter a whole number.')
    .refine((v) => Number(v) <= 10, 'At most 10 bedrooms.'),
  monthlyRent: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter an amount like 1450 or 1450.50.')
    .refine((v) => Number(v) > 0, 'Rent must be greater than 0.')
    .refine((v) => Number(v) <= 100000, 'Rent is too high.'),
  unitTypeId: z.number({ error: 'Select a unit type.' }).int().positive('Select a unit type.'),
});

export type UnitFormValues = z.infer<typeof unitSchema>;
