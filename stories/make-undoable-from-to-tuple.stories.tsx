import React, { useState } from 'react';
import { useFlexibleUndo } from '../.';
import { rootClass, btnContainerClass } from './styles';
import { ActionList } from './components/action-list';

export const MakeUndoableFromToTuple: React.FC = () => {
  const [count, setCount] = useState(1);

  const {
    makeUndoable,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useFlexibleUndo();

  const updateCount = makeUndoable<[number, number]>({
    type: 'updateCount',
    redo: ([to]) => setCount(to),
    undo: ([_, from]) => setCount(from),
  });

  const multiply = (amount: number) => updateCount([count, count * amount]);
  const divide = (amount: number) => updateCount([count, count / amount]);

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={btnContainerClass}>
        <button onClick={() => multiply(Math.PI)}>multiPI</button>
        <button onClick={() => divide(Math.PI)}>diPIde</button>
        <button disabled={!canUndo} onClick={() => undo()}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => redo()}>
          redo
        </button>
      </div>
      <ActionList stack={stack} timeTravel={timeTravel} />
    </div>
  );
};
