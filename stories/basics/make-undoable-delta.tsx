import React, { FC, useState } from 'react';
import { ActionList } from '../components/action-list';
import { rootClass, uiContainerClass } from '../styles';
import { useFlexibleUndo } from '../../.';

interface PayloadByType {
  add: number;
  subtract: number;
}

export const MakeUndoableExample: FC = () => {
  const [count, setCount] = useState(0);

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
      add: {
        drdo: amount => setCount(prev => prev + amount),
        undo: amount => setCount(prev => prev - amount),
      },
      subtract: {
        drdo: amount => setCount(prev => prev - amount),
        undo: amount => setCount(prev => prev + amount),
      },
    },
  });

  const { add, subtract } = undoables;

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
        <button onClick={() => add(2)}>add 2</button>
        <button onClick={() => subtract(1)}>subtract 1</button>
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
