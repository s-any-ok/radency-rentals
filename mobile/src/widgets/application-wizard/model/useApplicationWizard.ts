import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  applicationFormSchema,
  EMPTY_APPLICANT_INFO,
  useSaveApplicationSection,
  useSubmitApplication,
  type ApplicationDto,
  type ApplicationFormValues,
} from 'src/entities/application';
import { getErrorMessage, toApiError } from 'src/shared/api';
import { applyServerErrors, createId, submitChange, type ChangeOutcome } from 'src/shared/lib';

import { initialStepIndex, WIZARD_STEPS } from './steps';

const SECTION_FIELDS = ['applicantInfo', 'residences'] as const;

const noticeFor = (outcome: ChangeOutcome) =>
  outcome === 'queued' ? "You're offline — this change will sync when you reconnect." : null;

const toFormValues = (application: ApplicationDto): ApplicationFormValues => ({
  applicantInfo: application.applicantInfo ?? EMPTY_APPLICANT_INFO,
  residences: application.residences,
});

/**
 * One view model (one react-hook-form instance) drives the whole application page; the step
 * decides which section is shown. The buttons map to the API's single form action:
 *  - Continue: validate the current section → persist only when valid → next step
 *  - Back: previous step, nothing is saved (unsaved edits of the current section are dropped)
 *  - Submit: only from the Summary, only once both sections are saved (server's canSubmit)
 */
export const useApplicationWizard = (application: ApplicationDto) => {
  const saveSection = useSaveApplicationSection();
  const submitApplication = useSubmitApplication();
  const [stepIndex, setStepIndex] = useState(() => initialStepIndex(application));
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: toFormValues(application),
    // Sections are validated with trigger(), which doesn't count as a submit, so the default
    // "re-validate on change after submit" never kicks in and fixed fields kept their errors.
    // onTouched validates a field once it was left and then on every change.
    mode: 'onTouched',
  });
  const { trigger, getValues, reset, resetField, setError, formState } = form;

  // Take fresh server data (e.g. after a refetch) unless the user is in the middle of editing.
  useEffect(() => {
    if (!formState.isDirty) reset(toFormValues(application));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to new server versions
  }, [
    application.version,
    application.applicantInfoCompleted,
    application.residenceHistoryCompleted,
  ]);

  const step = WIZARD_STEPS[stepIndex]!;
  const readOnly = !application.isEditable;

  const handleError = useCallback(
    (error: unknown) => {
      const apiError = toApiError(error);
      const unmatched = applyServerErrors(setError, apiError.fieldErrors, SECTION_FIELDS);
      if (unmatched.length > 0 || Object.keys(apiError.fieldErrors).length === 0) {
        setFormError(getErrorMessage(error));
      }
    },
    [setError],
  );

  const goNext = useCallback(async () => {
    setFormError(null);

    // Read-only applications can still be browsed section by section.
    if (readOnly || step.key === 'Summary') {
      setStepIndex((i) => Math.min(i + 1, WIZARD_STEPS.length - 1));
      return;
    }

    const field = step.key === 'ApplicantInformation' ? 'applicantInfo' : 'residences';
    // Validate only the current section; invalid → stay and show the errors.
    if (!(await trigger(field))) return;

    setBusy(true);
    try {
      const outcome = await submitChange(saveSection, {
        id: application.id,
        section: step.key,
        ...(field === 'applicantInfo'
          ? { applicantInfo: getValues('applicantInfo') }
          : { residences: getValues('residences') }),
        version: application.version,
        idempotencyKey: createId(),
        description: `Save ${step.title.toLowerCase()} section`,
      });
      setNotice(noticeFor(outcome));
      // Saved values become the new baseline of the form.
      reset(getValues());
      setStepIndex((i) => i + 1);
    } catch (error) {
      handleError(error);
    } finally {
      setBusy(false);
    }
  }, [
    application.id,
    application.version,
    getValues,
    handleError,
    readOnly,
    reset,
    saveSection,
    step,
    trigger,
  ]);

  const goBack = useCallback(() => {
    setFormError(null);
    if (!readOnly && step.key !== 'Summary') {
      const field = step.key === 'ApplicantInformation' ? 'applicantInfo' : 'residences';
      resetField(field);
    }
    setStepIndex((i) => Math.max(i - 1, 0));
  }, [readOnly, resetField, step.key]);

  const goTo = useCallback(
    (index: number) => {
      // Jumping between steps doesn't save either; only completed or earlier steps are reachable.
      if (index < stepIndex || readOnly) setStepIndex(index);
    },
    [readOnly, stepIndex],
  );

  const submit = useCallback(async () => {
    setFormError(null);
    setBusy(true);
    try {
      const outcome = await submitChange(submitApplication, {
        id: application.id,
        version: application.version,
        idempotencyKey: createId(),
        description: `Submit application for unit ${application.unit.unitNumber}`,
      });
      setNotice(noticeFor(outcome));
    } catch (error) {
      handleError(error);
    } finally {
      setBusy(false);
    }
  }, [
    application.id,
    application.unit.unitNumber,
    application.version,
    handleError,
    submitApplication,
  ]);

  return {
    form,
    step,
    stepIndex,
    readOnly,
    busy,
    formError,
    notice,
    goNext,
    goBack,
    goTo,
    submit,
  };
};
