import React, { useState } from 'react';
import { useInfiniteUndo } from '../src';
import { btnContainerStyle } from './styles';

interface PayloadFromTo<T> {
  from: T;
  to: T;
}

export const FromTo: React.FC = () => {
  const [count, setCount] = useState(1);
  const { makeUndoable, canUndo, undo, canRedo, redo } = useInfiniteUndo();
  const multiply = makeUndoable<PayloadFromTo<number>>({
    type: 'multiply',
    do: ({ to }) => setCount(to),
    undo: ({ from }) => setCount(from),
  });
  return (
    <>
      <div>count = {count}</div>
      <div style={btnContainerStyle}>
        <button onClick={() => multiply({ from: count, to: count * Math.PI })}>
          multiPI
        </button>
        <button disabled={!canUndo} onClick={() => undo()}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => redo()}>
          redo
        </button>
      </div>
    </>
  );
};
