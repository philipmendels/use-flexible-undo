import { PayloadFromTo, Updater, CurriedUpdater } from './index.types';

export const makeUndoableFromToHandler = <T>(handler: (payload: T) => any) => ({
  do: ({ to }: PayloadFromTo<T>) => {
    handler(to);
  },
  undo: ({ from }: PayloadFromTo<T>) => {
    handler(from);
  },
});

export const makeHandler = <T extends any>(
  setter: (updater: Updater<T>) => any
) => (createUpdater: CurriedUpdater<T>) => (val: T) => {
  setter(createUpdater(val));
};
