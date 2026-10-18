import { QueryClient } from '@tanstack/react-query';

import { EMPTY_GUID, recordVersion, resolveVersion } from 'src/shared/lib';

import { propertyApi } from '../api';
import { propertyKeys, propertyMutationKeys } from '../keys';
import {
  CreatePropertyVariables,
  CreateUnitVariables,
  DeletePropertyVariables,
  DeleteUnitVariables,
  PropertyDetailsDto,
  PropertyDto,
  UnitDto,
  UpdatePropertyVariables,
  UpdateUnitVariables,
} from '../types';

const toUnitDto = (
  variables: CreateUnitVariables | UpdateUnitVariables,
  version: string,
): UnitDto => ({
  id: variables.id,
  propertyId: variables.propertyId,
  unitNumber: variables.unitNumber,
  bedrooms: variables.bedrooms,
  monthlyRent: variables.monthlyRent,
  unitTypeId: variables.unitTypeId,
  unitTypeName: variables.unitTypeName,
  unitTypeIsActive: true,
  isAvailable: true,
  leasedUntil: null,
  version,
});

/**
 * Registers request + optimistic-update logic for every property/unit change.
 * Registered at startup (before the persisted cache is restored) so queued offline changes
 * can be replayed after a restart. Versions sent to the server are rebased through the
 * version chain so several queued edits of one record don't conflict with each other.
 */
export const registerPropertyMutations = (queryClient: QueryClient) => {
  const updateDetail = (id: string, update: (current: PropertyDetailsDto) => PropertyDetailsDto) =>
    queryClient.setQueryData<PropertyDetailsDto>(propertyKeys.detail(id), (current) =>
      current ? update(current) : current,
    );

  const updateList = (update: (current: PropertyDto[]) => PropertyDto[]) =>
    queryClient.setQueryData<PropertyDto[]>(propertyKeys.list(), (current) =>
      current ? update(current) : current,
    );

  const refreshProperty = (propertyId?: string) => {
    void queryClient.invalidateQueries({ queryKey: propertyKeys.list() });
    void queryClient.invalidateQueries({ queryKey: propertyKeys.availableUnits() });
    if (propertyId) {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.detail(propertyId) });
    }
  };

  // ── Properties ───────────────────────────────────────────────────────────
  queryClient.setMutationDefaults<PropertyDetailsDto, Error, CreatePropertyVariables>(
    propertyMutationKeys.create,
    {
      mutationFn: async (variables: CreatePropertyVariables) => {
        const { id, name, address, city, idempotencyKey } = variables;
        const property = await propertyApi.create(id, { name, address, city }, idempotencyKey);
        // Edits queued before the create reached the server carry the placeholder version.
        recordVersion(id, EMPTY_GUID, property.version);
        return property;
      },
      onMutate: async (variables: CreatePropertyVariables) => {
        await queryClient.cancelQueries({ queryKey: propertyKeys.list() });
        const { id, name, address, city } = variables;
        updateList((list) => [
          ...list.filter((p) => p.id !== id),
          { id, name, address, city, unitCount: 0, availableUnitCount: 0, version: EMPTY_GUID },
        ]);
        queryClient.setQueryData<PropertyDetailsDto>(
          propertyKeys.detail(id),
          (current) => current ?? { id, name, address, city, units: [], version: EMPTY_GUID },
        );
      },
      onSuccess: (property: PropertyDetailsDto) => {
        queryClient.setQueryData(propertyKeys.detail(property.id), property);
      },
      onSettled: (_data: unknown, _error: unknown, variables: CreatePropertyVariables) =>
        refreshProperty(variables.id),
    },
  );

  queryClient.setMutationDefaults<PropertyDetailsDto, Error, UpdatePropertyVariables>(
    propertyMutationKeys.update,
    {
      mutationFn: async (variables: UpdatePropertyVariables) => {
        const { id, name, address, city, idempotencyKey } = variables;
        const version = resolveVersion(id, variables.version);
        const property = await propertyApi.update(
          id,
          { name, address, city },
          version,
          idempotencyKey,
        );
        recordVersion(id, version, property.version);
        return property;
      },
      onMutate: async (variables: UpdatePropertyVariables) => {
        await queryClient.cancelQueries({ queryKey: propertyKeys.all });
        const { id, name, address, city } = variables;
        updateList((list) => list.map((p) => (p.id === id ? { ...p, name, address, city } : p)));
        updateDetail(id, (p) => ({ ...p, name, address, city }));
      },
      onSuccess: (property: PropertyDetailsDto) => {
        queryClient.setQueryData(propertyKeys.detail(property.id), property);
      },
      onSettled: (_data: unknown, _error: unknown, variables: UpdatePropertyVariables) =>
        refreshProperty(variables.id),
    },
  );

  queryClient.setMutationDefaults<void, Error, DeletePropertyVariables>(
    propertyMutationKeys.remove,
    {
      mutationFn: (variables: DeletePropertyVariables) =>
        propertyApi.remove(
          variables.id,
          resolveVersion(variables.id, variables.version),
          variables.idempotencyKey,
        ),
      onMutate: async (variables: DeletePropertyVariables) => {
        await queryClient.cancelQueries({ queryKey: propertyKeys.list() });
        updateList((list) => list.filter((p) => p.id !== variables.id));
      },
      onSuccess: (_data: unknown, variables: DeletePropertyVariables) => {
        queryClient.removeQueries({ queryKey: propertyKeys.detail(variables.id) });
      },
      onSettled: () => refreshProperty(),
    },
  );

  // ── Units ────────────────────────────────────────────────────────────────
  queryClient.setMutationDefaults<UnitDto, Error, CreateUnitVariables>(
    propertyMutationKeys.createUnit,
    {
      mutationFn: async (variables: CreateUnitVariables) => {
        const { id, propertyId, unitNumber, bedrooms, monthlyRent, unitTypeId, idempotencyKey } =
          variables;
        const unit = await propertyApi.createUnit(
          propertyId,
          id,
          { unitNumber, bedrooms, monthlyRent, unitTypeId },
          idempotencyKey,
        );
        recordVersion(id, EMPTY_GUID, unit.version);
        return unit;
      },
      onMutate: async (variables: CreateUnitVariables) => {
        await queryClient.cancelQueries({ queryKey: propertyKeys.detail(variables.propertyId) });
        updateDetail(variables.propertyId, (p) => ({
          ...p,
          units: [
            ...p.units.filter((u) => u.id !== variables.id),
            toUnitDto(variables, EMPTY_GUID),
          ],
        }));
      },
      onSettled: (_data: unknown, _error: unknown, variables: CreateUnitVariables) =>
        refreshProperty(variables.propertyId),
    },
  );

  queryClient.setMutationDefaults<UnitDto, Error, UpdateUnitVariables>(
    propertyMutationKeys.updateUnit,
    {
      mutationFn: async (variables: UpdateUnitVariables) => {
        const { id, unitNumber, bedrooms, monthlyRent, unitTypeId, idempotencyKey } = variables;
        const version = resolveVersion(id, variables.version);
        const unit = await propertyApi.updateUnit(
          id,
          { unitNumber, bedrooms, monthlyRent, unitTypeId },
          version,
          idempotencyKey,
        );
        recordVersion(id, version, unit.version);
        return unit;
      },
      onMutate: async (variables: UpdateUnitVariables) => {
        await queryClient.cancelQueries({ queryKey: propertyKeys.detail(variables.propertyId) });
        updateDetail(variables.propertyId, (p) => ({
          ...p,
          units: p.units.map((u) =>
            u.id === variables.id
              ? {
                  ...u,
                  unitNumber: variables.unitNumber,
                  bedrooms: variables.bedrooms,
                  monthlyRent: variables.monthlyRent,
                  unitTypeId: variables.unitTypeId,
                  unitTypeName: variables.unitTypeName,
                }
              : u,
          ),
        }));
      },
      onSettled: (_data: unknown, _error: unknown, variables: UpdateUnitVariables) =>
        refreshProperty(variables.propertyId),
    },
  );

  queryClient.setMutationDefaults<void, Error, DeleteUnitVariables>(
    propertyMutationKeys.removeUnit,
    {
      mutationFn: (variables: DeleteUnitVariables) =>
        propertyApi.removeUnit(
          variables.id,
          resolveVersion(variables.id, variables.version),
          variables.idempotencyKey,
        ),
      onMutate: async (variables: DeleteUnitVariables) => {
        await queryClient.cancelQueries({ queryKey: propertyKeys.detail(variables.propertyId) });
        updateDetail(variables.propertyId, (p) => ({
          ...p,
          units: p.units.filter((u) => u.id !== variables.id),
        }));
      },
      onSettled: (_data: unknown, _error: unknown, variables: DeleteUnitVariables) =>
        refreshProperty(variables.propertyId),
    },
  );
};
