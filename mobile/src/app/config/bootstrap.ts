import { setupAuthInterceptor } from 'src/entities/session';
import { instance } from 'src/shared/api';
import {
  initializeNetInfo,
  initializeQueryNetwork,
  observeMutationQueue,
  queryClient,
} from 'src/shared/config';

import { registerMutations } from './registerMutations';

let bootstrapped = false;

/** One-time, module-level setup that must happen before the first render. */
export const bootstrap = () => {
  if (bootstrapped) return;
  bootstrapped = true;

  initializeNetInfo();
  // Connects NetInfo to TanStack Query's onlineManager (after NetInfo.configure).
  initializeQueryNetwork();
  setupAuthInterceptor(instance);
  registerMutations();
  observeMutationQueue(queryClient);
};
