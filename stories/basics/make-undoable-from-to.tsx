import React, { useState } from 'react';
import { useFlexibleUndo, PayloadFromTo } from '../../.';
import { rootClass, uiContainerClass } from '../styles';

export const MakeUndoableFromToExample: React.FC = () => {
  const [count, setCount] = useState(1);

  const { makeUndoable, canUndo, undo, canRedo, redo } = useFlexibleUndo();

  const updateCount = makeUndoable<PayloadFromTo<number>>({
    type: 'updateCount',
    drdo: ({ to }) => setCount(to),
    undo: ({ from }) => setCount(from),
  });

  const multiply = (amount: number) =>
    updateCount({ from: count, to: count * amount });
  const divide = (amount: number) =>
    updateCount({ from: count, to: count / amount });

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
        <button onClick={() => multiply(Math.PI)}>multi&pi;</button>
        <button onClick={() => divide(Math.PI)}>di&pi;de</button>
        <button disabled={!canUndo} onClick={() => undo()}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => redo()}>
          redo
        </button>
      </div>
      {/* <ActionList history={stack} timeTravel={timeTravel} /> */}
    </div>
  );
};
