import { useMemo } from 'react';
import { useUndoRedo } from './hooks/use-undo-redo';

import {
  PayloadByType,
  MetaActionReturnTypes,
  UFULightProps,
  HandlersWithUndefinedByType,
} from './index.types';

export const useFlexibleUndoLight = <
  PBT extends PayloadByType,
  MR extends MetaActionReturnTypes = undefined
>({
  handlers,
  ...rest
}: UFULightProps<PBT, MR>) => {
  const { createUndoables, ...undoRedoRest } = useUndoRedo({
    handlers: { current: handlers },
    ...rest,
  });

  const undoables = useMemo(
    () => createUndoables(handlers) as HandlersWithUndefinedByType<PBT>,
    [handlers, createUndoables]
  );

  return {
    undoables,
    ...undoRedoRest,
  };
};