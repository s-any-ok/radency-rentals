export const propertyKeys = {
  all: ['properties'] as const,
  list: () => [...propertyKeys.all, 'list'] as const,
  detail: (id: string) => [...propertyKeys.all, 'detail', id] as const,
  availableUnits: () => [...propertyKeys.all, 'available-units'] as const,
  unitTypes: () => ['unit-types'] as const,
};

export const propertyMutationKeys = {
  create: ['property', 'create'] as const,
  update: ['property', 'update'] as const,
  remove: ['property', 'delete'] as const,
  createUnit: ['unit', 'create'] as const,
  updateUnit: ['unit', 'update'] as const,
  removeUnit: ['unit', 'delete'] as const,
};
