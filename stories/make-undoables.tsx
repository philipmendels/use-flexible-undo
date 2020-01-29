import React, { useState } from 'react';
import { useFlexibleUndo } from '../src';
import { btnContainerClass, rootClass } from './styles';
import { ActionList } from './components/action-list';

interface PayloadByType {
  add: number;
  subtract: number;
}

export const MakeUndoables: React.FC = () => {
  const [count, setCount] = useState(0);
  const {
    makeUndoables,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useFlexibleUndo({ onUndo: ({ action }) => console.log('undo', action) });

  const { add, subtract } = makeUndoables<PayloadByType>({
    add: {
      do: amount => setCount(prev => prev + amount),
      undo: amount => setCount(prev => prev - amount),
    },
    subtract: {
      do: amount => setCount(prev => prev - amount),
      undo: amount => setCount(prev => prev + amount),
    },
  });
  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={btnContainerClass}>
        <button onClick={() => add(1)}>add 1</button>
        <button onClick={() => subtract(2)}>subtract 2</button>
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
