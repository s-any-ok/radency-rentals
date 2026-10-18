import type { ApplicationDto, ApplicationSection } from 'src/entities/application';

export type WizardStep = ApplicationSection | 'Summary';

export const WIZARD_STEPS: { key: WizardStep; title: string }[] = [
  { key: 'ApplicantInformation', title: 'Applicant' },
  { key: 'ResidenceHistory', title: 'Residences' },
  { key: 'Summary', title: 'Summary' },
];

/** Opens the first section that still needs saving (or the summary when both are saved). */
export const initialStepIndex = (application: ApplicationDto): number => {
  if (!application.isEditable) return WIZARD_STEPS.length - 1;
  if (!application.applicantInfoCompleted) return 0;
  if (!application.residenceHistoryCompleted) return 1;
  return 2;
};

export const isStepCompleted = (application: ApplicationDto, step: WizardStep): boolean =>
  step === 'ApplicantInformation'
    ? application.applicantInfoCompleted
    : step === 'ResidenceHistory'
      ? application.residenceHistoryCompleted
      : application.status !== 'Draft' && application.status !== 'Returned';
