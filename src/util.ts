import {
  PayloadFromTo,
  Updater,
  CurriedUpdater,
  PayloadHandler,
  Undoable,
} from './index.types';

export const makeHandler = <T extends any>(
  setter: (updater: Updater<T>) => any
) => (createUpdater: CurriedUpdater<T>): PayloadHandler<T> => val => {
  setter(createUpdater(val));
};

export const makeUndoableHandler = <T>(
  redo: (payload: T) => any,
  undo: (payload: T) => any
) => ({ redo, undo });

export const makeUndoableFromToHandler = <T>(handler: (payload: T) => any) => ({
  redo: ({ to }: PayloadFromTo<T>) => {
    handler(to);
  },
  undo: ({ from }: PayloadFromTo<T>) => {
    handler(from);
  },
});

export const invertUndoable = <T>(undoable: Undoable<T>): Undoable<T> => ({
  redo: undoable.undo,
  undo: undoable.redo,
});
