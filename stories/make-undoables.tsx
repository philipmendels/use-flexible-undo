import React, { useState } from 'react';
import { useInfiniteUndo } from '../src';
import { btnContainerStyle } from './styles';

interface PayloadByType {
  add: number;
  subtract: number;
}

export const MakeUndoables: React.FC = () => {
  const [count, setCount] = useState(0);
  const { makeUndoables, canUndo, undo, canRedo, redo } = useInfiniteUndo();
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
    <>
      <div>count = {count}</div>
      <div style={btnContainerStyle}>
        <button onClick={() => add(1)}>add 1</button>
        <button onClick={() => subtract(2)}>subtract 2</button>
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
