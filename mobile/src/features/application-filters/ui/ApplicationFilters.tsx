import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';

import { APPLICATION_STATUSES, APPLICATION_STATUS_META } from 'src/entities/application';
import { useProperties } from 'src/entities/property';
import { useApplicationFiltersStore } from 'src/shared/model';
import { Chip, SelectField, type SelectOption } from 'src/shared/ui';

const ALL = 'all';

/** Status + property filters. Values live in the filters store and are sent to the API as query params. */
export const ApplicationFilters = () => {
  const status = useApplicationFiltersStore((s) => s.status);
  const propertyId = useApplicationFiltersStore((s) => s.propertyId);
  const setStatus = useApplicationFiltersStore((s) => s.setStatus);
  const setPropertyId = useApplicationFiltersStore((s) => s.setPropertyId);
  const { data: properties = [] } = useProperties();

  const propertyOptions = useMemo<SelectOption<string>[]>(
    () => [
      { value: ALL, label: 'All properties' },
      ...properties.map((p) => ({ value: p.id, label: p.name })),
    ],
    [properties],
  );

  return (
    <View className="pb-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-4 pb-3"
      >
        <Chip
          label="All"
          selected={status === null}
          onPress={() => setStatus(null)}
        />
        {APPLICATION_STATUSES.map((value) => (
          <Chip
            key={value}
            label={APPLICATION_STATUS_META[value].label}
            selected={status === value}
            onPress={() => setStatus(value)}
          />
        ))}
      </ScrollView>
      <View className="px-4">
        <SelectField
          label="Property"
          value={propertyId ?? ALL}
          options={propertyOptions}
          onChange={(value) => setPropertyId(value === ALL ? null : value)}
        />
      </View>
    </View>
  );
};
