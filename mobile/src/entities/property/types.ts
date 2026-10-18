export type UnitDto = {
  id: string;
  propertyId: string;
  unitNumber: string;
  bedrooms: number;
  monthlyRent: number;
  unitTypeId: number;
  unitTypeName: string;
  unitTypeIsActive: boolean;
  isAvailable: boolean;
  /** Set while a lease covers today ("YYYY-MM-DD", exclusive end). */
  leasedUntil: string | null;
  version: string;
};

export type PropertyDto = {
  id: string;
  name: string;
  address: string;
  city: string;
  unitCount: number;
  availableUnitCount: number;
  version: string;
};

export type PropertyDetailsDto = {
  id: string;
  name: string;
  address: string;
  city: string;
  units: UnitDto[];
  version: string;
};

export type AvailableUnitDto = {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  city: string;
  unitNumber: string;
  bedrooms: number;
  monthlyRent: number;
  unitTypeName: string;
};

export type UnitTypeDto = {
  id: number;
  name: string;
  isActive: boolean;
};

export type PropertyInput = {
  name: string;
  address: string;
  city: string;
};

export type UnitInput = {
  unitNumber: string;
  bedrooms: number;
  monthlyRent: number;
  unitTypeId: number;
};

/** Fields every queued change carries (see the offline queue in shared/config). */
type QueuedChange = {
  idempotencyKey: string;
  description: string;
};

export type CreatePropertyVariables = QueuedChange & PropertyInput & { id: string };
export type UpdatePropertyVariables = QueuedChange &
  PropertyInput & { id: string; version: string };
export type DeletePropertyVariables = QueuedChange & { id: string; version: string };

export type CreateUnitVariables = QueuedChange &
  UnitInput & { id: string; propertyId: string; unitTypeName: string };
export type UpdateUnitVariables = QueuedChange &
  UnitInput & { id: string; propertyId: string; unitTypeName: string; version: string };
export type DeleteUnitVariables = QueuedChange & {
  id: string;
  propertyId: string;
  version: string;
};
