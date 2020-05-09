import { UFUOptions } from './index.types';

export const defaultOptions: Required<UFUOptions> = {
  unstable_callHandlersFrom: 'UPDATER',
  unstable_waitForNextUpdate: false,
  storeActionCreatedDate: true,
};
