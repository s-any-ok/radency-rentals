import { apiFacade, idempotent } from 'src/shared/api';

import {
  AvailableUnitDto,
  PropertyDetailsDto,
  PropertyDto,
  PropertyInput,
  UnitDto,
  UnitInput,
  UnitTypeDto,
} from './types';

export const propertyApi = {
  list: () => apiFacade.get<PropertyDto[]>('/properties'),
  get: (id: string) => apiFacade.get<PropertyDetailsDto>(`/properties/${id}`),
  create: (id: string, input: PropertyInput, idempotencyKey: string) =>
    apiFacade.post<PropertyDetailsDto>('/properties', { id, ...input }, idempotent(idempotencyKey)),
  update: (id: string, input: PropertyInput, version: string, idempotencyKey: string) =>
    apiFacade.put<PropertyDetailsDto>(
      `/properties/${id}`,
      { ...input, version },
      idempotent(idempotencyKey),
    ),
  remove: (id: string, version: string, idempotencyKey: string) =>
    apiFacade.delete(`/properties/${id}`, idempotent(idempotencyKey, { params: { version } })),

  createUnit: (propertyId: string, id: string, input: UnitInput, idempotencyKey: string) =>
    apiFacade.post<UnitDto>(
      `/properties/${propertyId}/units`,
      { id, ...input },
      idempotent(idempotencyKey),
    ),
  updateUnit: (id: string, input: UnitInput, version: string, idempotencyKey: string) =>
    apiFacade.put<UnitDto>(`/units/${id}`, { ...input, version }, idempotent(idempotencyKey)),
  removeUnit: (id: string, version: string, idempotencyKey: string) =>
    apiFacade.delete(`/units/${id}`, idempotent(idempotencyKey, { params: { version } })),

  availableUnits: (propertyId?: string | null) =>
    apiFacade.get<AvailableUnitDto[]>('/units/available', {
      params: propertyId ? { propertyId } : undefined,
    }),
  unitTypes: () => apiFacade.get<UnitTypeDto[]>('/unit-types'),
};
