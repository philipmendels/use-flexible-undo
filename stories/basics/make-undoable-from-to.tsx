import React, { useState } from 'react';
import { useFlexibleUndo, PayloadFromTo } from '../../.';
import { root, ui } from '../styles';
import { ActionList } from '../components/action-list';

interface PayloadByType {
  updateCount: PayloadFromTo<number>;
}

export const MakeUndoableFromToExample: React.FC = () => {
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
      updateCount: {
        drdo: ({ to }) => setCount(to),
        undo: ({ from }) => setCount(from),
      },
    },
  });

  const { updateCount } = undoables;

  const add = (amount: number) =>
    updateCount({ from: count, to: count + amount });
  const subtract = (amount: number) =>
    updateCount({ from: count, to: count - amount });
  const multiply = (amount: number) =>
    updateCount({ from: count, to: count * amount });
  const divide = (amount: number) =>
    updateCount({ from: count, to: count / amount });

  return (
    <div className={root}>
      <div>count = {count}</div>
      <div className={ui}>
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
