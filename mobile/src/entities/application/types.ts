export const APPLICATION_STATUSES = [
  'Draft',
  'Submitted',
  'Returned',
  'Approved',
  'Denied',
  'Withdrawn',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type ReviewOutcome = 'Approve' | 'Return' | 'Deny';

export type ApplicationSection = 'ApplicantInformation' | 'ResidenceHistory';

export type ApplicantInfo = {
  fullName: string;
  phone: string;
  email: string;
  currentAddress: string;
};

export type Residence = {
  address: string;
  landlordName: string;
  landlordPhone: string;
  /** "YYYY-MM-DD" */
  moveInDate: string;
  /** "YYYY-MM-DD" */
  moveOutDate: string;
};

export type UnitSummary = {
  id: string;
  unitNumber: string;
  bedrooms: number;
  monthlyRent: number;
  unitTypeName: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
};

export type Lease = {
  id: string;
  startDate: string;
  endDate: string;
};

/** The single view model behind the application page. Permission flags are decided by the server. */
export type ApplicationDto = {
  id: string;
  status: ApplicationStatus;
  unit: UnitSummary;
  applicantId: string;
  applicantName: string;
  applicantInfo: ApplicantInfo | null;
  residences: Residence[];
  applicantInfoCompleted: boolean;
  residenceHistoryCompleted: boolean;
  isEditable: boolean;
  canSubmit: boolean;
  canWithdraw: boolean;
  canReview: boolean;
  lease: Lease | null;
  /** Comment of the latest review (e.g. what to fix after the application was returned). */
  lastReviewComment: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  version: string;
};

export type ApplicationListItem = {
  id: string;
  status: ApplicationStatus;
  unitId: string;
  unitNumber: string;
  propertyId: string;
  propertyName: string;
  applicantName: string;
  monthlyRent: number;
  createdAt: string;
  submittedAt: string | null;
  updatedAt: string;
};

export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ApplicationSortField =
  'UpdatedAt' | 'CreatedAt' | 'SubmittedAt' | 'Status' | 'Property' | 'Applicant';

export type ApplicationListParams = {
  status: ApplicationStatus | null;
  propertyId: string | null;
  page: number;
  pageSize: number;
  sortBy: ApplicationSortField;
  sortDirection: 'Asc' | 'Desc';
};

export type StatusChange = {
  id: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  outcome: ReviewOutcome | null;
  comment: string | null;
  changedBy: string;
  changedAt: string;
};

export type ManagerNote = {
  text: string;
  updatedBy: string | null;
  updatedAt: string | null;
  version: string | null;
};

type QueuedChange = {
  idempotencyKey: string;
  description: string;
};

export type CreateApplicationVariables = QueuedChange & {
  id: string;
  unit: UnitSummary;
  applicantId: string;
  applicantName: string;
};

export type SaveSectionVariables = QueuedChange & {
  id: string;
  section: ApplicationSection;
  applicantInfo?: ApplicantInfo;
  residences?: Residence[];
  version: string;
};

export type SubmitApplicationVariables = QueuedChange & { id: string; version: string };

export type WithdrawApplicationVariables = QueuedChange & { id: string; version: string };

export type ReviewApplicationVariables = QueuedChange & {
  id: string;
  outcome: ReviewOutcome;
  comment: string | null;
  version: string;
};

export type UpdateManagerNoteVariables = QueuedChange & {
  id: string;
  text: string;
  version: string | null;
};
