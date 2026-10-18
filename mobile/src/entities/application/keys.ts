import { ApplicationListParams } from './types';

export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (params: ApplicationListParams) => [...applicationKeys.lists(), params] as const,
  detail: (id: string) => [...applicationKeys.all, 'detail', id] as const,
  history: (id: string) => [...applicationKeys.all, 'history', id] as const,
  note: (id: string) => [...applicationKeys.all, 'note', id] as const,
};

export const applicationMutationKeys = {
  create: ['application', 'create'] as const,
  saveSection: ['application', 'save-section'] as const,
  submit: ['application', 'submit'] as const,
  withdraw: ['application', 'withdraw'] as const,
  review: ['application', 'review'] as const,
  updateNote: ['application', 'update-note'] as const,
};
