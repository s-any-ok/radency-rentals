import { apiFacade, idempotent } from 'src/shared/api';

import {
  ApplicantInfo,
  ApplicationDto,
  ApplicationListItem,
  ApplicationListParams,
  ApplicationSection,
  ManagerNote,
  PagedResult,
  Residence,
  ReviewOutcome,
  StatusChange,
} from './types';

type FormBody = {
  command: 'Continue' | 'Submit';
  section?: ApplicationSection;
  applicantInfo?: ApplicantInfo;
  residences?: Residence[];
  version: string;
};

export const applicationApi = {
  list: ({ status, propertyId, ...rest }: ApplicationListParams) =>
    apiFacade.get<PagedResult<ApplicationListItem>>('/applications', {
      params: {
        ...rest,
        ...(status ? { status } : {}),
        ...(propertyId ? { propertyId } : {}),
      },
    }),
  get: (id: string) => apiFacade.get<ApplicationDto>(`/applications/${id}`),
  create: (id: string, unitId: string, idempotencyKey: string) =>
    apiFacade.post<ApplicationDto>('/applications', { id, unitId }, idempotent(idempotencyKey)),
  /** The application page's single form action; the command is the button that was pressed. */
  postForm: (id: string, body: FormBody, idempotencyKey: string) =>
    apiFacade.post<ApplicationDto>(`/applications/${id}/form`, body, idempotent(idempotencyKey)),
  withdraw: (id: string, version: string, idempotencyKey: string) =>
    apiFacade.post<ApplicationDto>(
      `/applications/${id}/withdraw`,
      { version },
      idempotent(idempotencyKey),
    ),
  review: (
    id: string,
    body: { outcome: ReviewOutcome; comment: string | null; version: string },
    idempotencyKey: string,
  ) =>
    apiFacade.post<ApplicationDto>(`/applications/${id}/review`, body, idempotent(idempotencyKey)),
  history: (id: string) => apiFacade.get<StatusChange[]>(`/applications/${id}/history`),
  getNote: (id: string) => apiFacade.get<ManagerNote>(`/applications/${id}/notes`),
  updateNote: (
    id: string,
    body: { text: string; version: string | null },
    idempotencyKey: string,
  ) => apiFacade.put<ManagerNote>(`/applications/${id}/notes`, body, idempotent(idempotencyKey)),
};
