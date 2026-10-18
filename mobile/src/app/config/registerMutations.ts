import { registerApplicationMutations } from 'src/entities/application';
import { propertyKeys, registerPropertyMutations } from 'src/entities/property';
import { queryClient } from 'src/shared/config';

/**
 * Mutation logic is registered by key (not inside components) so that changes queued offline,
 * persisted, and restored after an app restart can still run. Must run before the cache restore.
 */
export const registerMutations = () => {
  registerPropertyMutations(queryClient);
  registerApplicationMutations(queryClient, {
    // An approval issues a lease, which changes unit availability in the property entity.
    onReviewSettled: () => void queryClient.invalidateQueries({ queryKey: propertyKeys.all }),
  });
};
