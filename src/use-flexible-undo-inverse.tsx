import { useMemo } from 'react';

import { PayloadByType, UFUInverseProps } from './index.types';
import { createInitialHistory } from './updaters';
import { combineHandlersByType } from './util';
import { useFlexibleUndo } from '.';

export const useFlexibleUndoInverse = <PBT extends PayloadByType>({
  drdoHandlers,
  undoHandlers,
  options,
  initialHistory = createInitialHistory(),
}: UFUInverseProps<PBT>) => {
  const handlers = useMemo(
    () => combineHandlersByType(drdoHandlers, undoHandlers),
    [drdoHandlers, undoHandlers]
  );
  return useFlexibleUndo({ handlers, options, initialHistory });
};
