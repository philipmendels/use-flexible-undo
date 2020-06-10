import React, { useState } from 'react';
import {
  useFlexibleUndo,
  PayloadFromTo,
  makeUndoableFTObjHandler,
  wrapFTObjHandler,
} from '../../.';
import { rootClass, uiContainerClass } from '../../stories/styles';
import { ActionList } from '../../stories/components/action-list';

interface PayloadByType {
  updateCount: PayloadFromTo<number>;
}

export const MakeUndoableFTObjHandlerExample: React.FC = () => {
  const [count, setCount] = useState(1);

  const {
    undoables,
    canUndo,
    undo,
    canRedo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useFlexibleUndo<PayloadByType>({
    handlers: {
      updateCount: makeUndoableFTObjHandler(setCount),
    },
  });

  const { updateCount } = undoables;

  const countHandler = wrapFTObjHandler(updateCount, count);

  const add = countHandler(amount => prev => prev + amount);
  const subtract = countHandler(amount => prev => prev - amount);
  const multiply = countHandler(amount => prev => prev * amount);
  const divide = countHandler(amount => prev => prev / amount);

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
        <button onClick={() => add(2)}>add 2</button>
        <button onClick={() => subtract(1)}>subtract 1</button>
        <button onClick={() => multiply(Math.PI)}>multi&pi;</button>
        <button onClick={() => divide(Math.PI)}>di&pi;de</button>
        <button disabled={!canUndo} onClick={() => undo()}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => redo()}>
          redo
        </button>
      </div>
      <ActionList
        history={history}
        timeTravel={timeTravel}
        switchToBranch={switchToBranch}
      />
    </div>
  );
};
