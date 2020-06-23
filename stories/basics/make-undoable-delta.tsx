import React, { FC, useState } from 'react';
import { ActionList } from '../components/action-list';
import { root, ui, countContainer } from '../styles';
import { useFlexibleUndo } from '../../.';
import { BranchNav } from '../components/branch-nav';

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
    <div className={root}>
      <div className={ui}>
        <div className={countContainer}>count = {count}</div>
        <div>
          <button onClick={() => add(2)}>add 2</button>
          <button onClick={() => subtract(1)}>subtract 1</button>
        </div>
        <BranchNav
          history={history}
          switchToBranch={switchToBranch}
          canUndo={canUndo}
          canRedo={canRedo}
          undo={undo}
          redo={redo}
        />
      </div>
      <ActionList
        history={history}
        timeTravel={timeTravel}
        switchToBranch={switchToBranch}
      />
    </div>
  );
};
