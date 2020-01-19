import {
  PayloadFromTo,
  Updater,
  CurriedUpdater,
  PayloadHandler,
  UndoableHandler,
} from './index.types';

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
) => (createUpdater: CurriedUpdater<T>): PayloadHandler<T> => val => {
  setter(createUpdater(val));
};

export const invertUndoableHandler = <T>(
  handler: UndoableHandler<T>
): UndoableHandler<T> => ({
  do: handler.undo,
  undo: handler.do,
});
