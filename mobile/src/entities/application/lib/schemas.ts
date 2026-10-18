import { z } from 'zod';

import { todayIsoDate } from 'src/shared/lib';

/** Same pattern as the API: optional +, digits, spaces, dashes, parentheses. */
const PHONE_PATTERN = /^\+?[0-9\s\-()]{7,20}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Rules for each section are defined once and reused by the wizard and the residence modal. */
export const applicantInfoSchema = z.object({
  fullName: z.string().trim().min(1, 'Name is required.').max(200),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone is required.')
    .regex(PHONE_PATTERN, 'Enter a valid phone number.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .pipe(z.email('Enter a valid email address.')),
  currentAddress: z.string().trim().min(1, 'Current address is required.').max(300),
});

export const residenceSchema = z
  .object({
    address: z.string().trim().min(1, 'Address is required.').max(300),
    landlordName: z.string().trim().min(1, 'Landlord name is required.').max(200),
    landlordPhone: z
      .string()
      .trim()
      .min(1, 'Landlord phone is required.')
      .regex(PHONE_PATTERN, 'Enter a valid phone number.'),
    moveInDate: z.string().regex(ISO_DATE, 'Move-in date is required.'),
    moveOutDate: z.string().regex(ISO_DATE, 'Move-out date is required.'),
  })
  // ISO dates compare correctly as strings.
  .refine((r) => r.moveOutDate > r.moveInDate, {
    path: ['moveOutDate'],
    message: 'Move-out date must be after the move-in date.',
  })
  .refine((r) => r.moveOutDate <= todayIsoDate(), {
    path: ['moveOutDate'],
    message: "Move-out date can't be in the future.",
  });

export const residencesSchema = z
  .array(residenceSchema)
  .min(1, 'Add at least one prior residence.')
  .max(20, 'No more than 20 residences can be added.');

/** The whole application page is one form (one view model); sections validate their own part. */
export const applicationFormSchema = z.object({
  applicantInfo: applicantInfoSchema,
  residences: residencesSchema,
});

export type ApplicantInfoFormValues = z.infer<typeof applicantInfoSchema>;
export type ResidenceFormValues = z.infer<typeof residenceSchema>;
export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

export const EMPTY_APPLICANT_INFO: ApplicantInfoFormValues = {
  fullName: '',
  phone: '',
  email: '',
  currentAddress: '',
};

export const EMPTY_RESIDENCE: ResidenceFormValues = {
  address: '',
  landlordName: '',
  landlordPhone: '',
  moveInDate: '',
  moveOutDate: '',
};
