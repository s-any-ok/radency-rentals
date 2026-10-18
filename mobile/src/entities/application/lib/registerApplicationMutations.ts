import { QueryClient } from '@tanstack/react-query';

import { EMPTY_GUID, recordVersion, resolveVersion } from 'src/shared/lib';

import { applicationApi } from '../api';
import { applicationKeys, applicationMutationKeys } from '../keys';
import {
  ApplicationDto,
  ApplicationListItem,
  ApplicationListParams,
  ApplicationStatus,
  CreateApplicationVariables,
  ManagerNote,
  PagedResult,
  ReviewApplicationVariables,
  ReviewOutcome,
  SaveSectionVariables,
  SubmitApplicationVariables,
  UpdateManagerNoteVariables,
  WithdrawApplicationVariables,
} from '../types';

const REVIEW_RESULT: Record<ReviewOutcome, ApplicationStatus> = {
  Approve: 'Approved',
  Return: 'Returned',
  Deny: 'Denied',
};

type Options = {
  /** Called after a review settles: an approval changes unit availability (another entity's data). */
  onReviewSettled?: () => void;
};

/**
 * Registers request + optimistic-update logic for every application change. Registered at
 * startup (before the persisted cache is restored) so changes queued offline replay after a
 * restart. Optimistic updates keep the base version; the version chain rebases later queued
 * changes onto the versions our own earlier changes produced.
 */
export const registerApplicationMutations = (queryClient: QueryClient, options: Options = {}) => {
  const patchDetail = (id: string, patch: (current: ApplicationDto) => ApplicationDto) =>
    queryClient.setQueryData<ApplicationDto>(applicationKeys.detail(id), (current) =>
      current ? patch(current) : current,
    );

  const cancelDetail = (id: string) =>
    queryClient.cancelQueries({ queryKey: applicationKeys.detail(id) });

  const refresh = (id: string) => {
    void queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
    void queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: applicationKeys.history(id) });
  };

  const storeResult = (application: ApplicationDto) =>
    queryClient.setQueryData(applicationKeys.detail(application.id), application);

  /** Sends a versioned change and records the version it produced. */
  const sendVersioned = async (
    id: string,
    baseVersion: string,
    send: (version: string) => Promise<ApplicationDto>,
  ) => {
    const version = resolveVersion(id, baseVersion);
    const result = await send(version);
    recordVersion(id, version, result.version);
    return result;
  };

  /** Shows a draft created offline at the top of matching first pages of the list. */
  const prependToLists = (item: ApplicationListItem) => {
    for (const [key, data] of queryClient.getQueriesData<PagedResult<ApplicationListItem>>({
      queryKey: applicationKeys.lists(),
    })) {
      const params = key[2] as ApplicationListParams | undefined;
      if (!data || !params || params.page !== 1) continue;
      if (params.status && params.status !== item.status) continue;
      if (params.propertyId && params.propertyId !== item.propertyId) continue;
      queryClient.setQueryData<PagedResult<ApplicationListItem>>(key, {
        ...data,
        items: [item, ...data.items.filter((i) => i.id !== item.id)],
        total: data.total + 1,
      });
    }
  };

  queryClient.setMutationDefaults<ApplicationDto, Error, CreateApplicationVariables>(
    applicationMutationKeys.create,
    {
      mutationFn: async ({ id, unit, idempotencyKey }) => {
        const application = await applicationApi.create(id, unit.id, idempotencyKey);
        recordVersion(id, EMPTY_GUID, application.version);
        return application;
      },
      onMutate: async ({ id, unit, applicantId, applicantName }) => {
        const now = new Date().toISOString();
        queryClient.setQueryData<ApplicationDto>(
          applicationKeys.detail(id),
          (current) =>
            current ?? {
              id,
              status: 'Draft',
              unit,
              applicantId,
              applicantName,
              applicantInfo: null,
              residences: [],
              applicantInfoCompleted: false,
              residenceHistoryCompleted: false,
              isEditable: true,
              canSubmit: false,
              canWithdraw: true,
              canReview: false,
              lease: null,
              lastReviewComment: null,
              createdAt: now,
              updatedAt: now,
              submittedAt: null,
              version: EMPTY_GUID,
            },
        );
        prependToLists({
          id,
          status: 'Draft',
          unitId: unit.id,
          unitNumber: unit.unitNumber,
          propertyId: unit.propertyId,
          propertyName: unit.propertyName,
          applicantName,
          monthlyRent: unit.monthlyRent,
          createdAt: now,
          submittedAt: null,
          updatedAt: now,
        });
      },
      onSuccess: storeResult,
      onSettled: (_data, _error, { id }) => refresh(id),
    },
  );

  queryClient.setMutationDefaults<ApplicationDto, Error, SaveSectionVariables>(
    applicationMutationKeys.saveSection,
    {
      mutationFn: ({ id, version, section, applicantInfo, residences, idempotencyKey }) =>
        sendVersioned(id, version, (resolved) =>
          applicationApi.postForm(
            id,
            { command: 'Continue', section, applicantInfo, residences, version: resolved },
            idempotencyKey,
          ),
        ),
      onMutate: async ({ id, section, applicantInfo, residences }) => {
        await cancelDetail(id);
        patchDetail(id, (current) => {
          const next =
            section === 'ApplicantInformation'
              ? { ...current, applicantInfo: applicantInfo ?? null, applicantInfoCompleted: true }
              : { ...current, residences: residences ?? [], residenceHistoryCompleted: true };
          return {
            ...next,
            canSubmit:
              next.isEditable && next.applicantInfoCompleted && next.residenceHistoryCompleted,
          };
        });
      },
      onSuccess: storeResult,
      onSettled: (_data, _error, { id }) => refresh(id),
    },
  );

  queryClient.setMutationDefaults<ApplicationDto, Error, SubmitApplicationVariables>(
    applicationMutationKeys.submit,
    {
      mutationFn: ({ id, version, idempotencyKey }) =>
        sendVersioned(id, version, (resolved) =>
          applicationApi.postForm(id, { command: 'Submit', version: resolved }, idempotencyKey),
        ),
      onMutate: async ({ id }) => {
        await cancelDetail(id);
        patchDetail(id, (current) => ({
          ...current,
          status: 'Submitted',
          isEditable: false,
          canSubmit: false,
          submittedAt: new Date().toISOString(),
        }));
      },
      onSuccess: storeResult,
      onSettled: (_data, _error, { id }) => refresh(id),
    },
  );

  queryClient.setMutationDefaults<ApplicationDto, Error, WithdrawApplicationVariables>(
    applicationMutationKeys.withdraw,
    {
      mutationFn: ({ id, version, idempotencyKey }) =>
        sendVersioned(id, version, (resolved) =>
          applicationApi.withdraw(id, resolved, idempotencyKey),
        ),
      onMutate: async ({ id }) => {
        await cancelDetail(id);
        patchDetail(id, (current) => ({
          ...current,
          status: 'Withdrawn',
          isEditable: false,
          canSubmit: false,
          canWithdraw: false,
        }));
      },
      onSuccess: storeResult,
      onSettled: (_data, _error, { id }) => refresh(id),
    },
  );

  queryClient.setMutationDefaults<ApplicationDto, Error, ReviewApplicationVariables>(
    applicationMutationKeys.review,
    {
      mutationFn: ({ id, version, outcome, comment, idempotencyKey }) =>
        sendVersioned(id, version, (resolved) =>
          applicationApi.review(id, { outcome, comment, version: resolved }, idempotencyKey),
        ),
      onMutate: async ({ id, outcome }) => {
        await cancelDetail(id);
        patchDetail(id, (current) => ({
          ...current,
          status: REVIEW_RESULT[outcome],
          canReview: false,
        }));
      },
      onSuccess: storeResult,
      onSettled: (_data, _error, { id }) => {
        refresh(id);
        options.onReviewSettled?.();
      },
    },
  );

  queryClient.setMutationDefaults<ManagerNote, Error, UpdateManagerNoteVariables>(
    applicationMutationKeys.updateNote,
    {
      mutationFn: async ({ id, text, version, idempotencyKey }) => {
        // The note has its own version, tracked under its own key in the chain.
        const chainKey = `note:${id}`;
        const resolved = version ? resolveVersion(chainKey, version) : version;
        const note = await applicationApi.updateNote(
          id,
          { text, version: resolved },
          idempotencyKey,
        );
        if (note.version) recordVersion(chainKey, resolved ?? EMPTY_GUID, note.version);
        return note;
      },
      onMutate: async ({ id, text }) => {
        await queryClient.cancelQueries({ queryKey: applicationKeys.note(id) });
        queryClient.setQueryData<ManagerNote>(applicationKeys.note(id), (current) =>
          current ? { ...current, text } : current,
        );
      },
      onSuccess: (note, { id }) => queryClient.setQueryData(applicationKeys.note(id), note),
      onSettled: (_data, _error, { id }) =>
        queryClient.invalidateQueries({ queryKey: applicationKeys.note(id) }),
    },
  );
};
