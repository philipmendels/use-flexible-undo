import React, { useState } from 'react';
import { useFlexibleUndo, makeUndoableFTTupleHandler } from '../../.';
import { rootClass, uiContainerClass } from '../styles';
import { ActionList } from '../components/action-list';

interface PayloadByType {
  updateCount: [number, number];
}

export const MakeUndoableFTTupleHandlerExample: React.FC = () => {
  const [count, setCount] = useState(1);

  const {
    makeUndoables,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useFlexibleUndo();

  const { updateCount } = makeUndoables<PayloadByType>({
    updateCount: makeUndoableFTTupleHandler(setCount),
  });

  const multiply = (amount: number) => updateCount([count, count * amount]);
  const divide = (amount: number) => updateCount([count, count / amount]);

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
      <ActionList stack={stack} timeTravel={timeTravel} />
    </div>
  );
};
