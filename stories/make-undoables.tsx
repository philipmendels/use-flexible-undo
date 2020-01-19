import React, { useState } from 'react';
import { useInfiniteUndo } from '../src';
import { btnContainerStyle } from './styles';
import { PayloadFromTo } from '../src/index.types';

interface PayloadByType {
  multiply: PayloadFromTo<number>;
  divide: PayloadFromTo<number>;
}

export const MakeUndoables: React.FC = () => {
  const [count, setCount] = useState(1);
  const { makeUndoables, canUndo, undo, canRedo, redo } = useInfiniteUndo();
  const { multiply, divide } = makeUndoables<PayloadByType>({
    multiply: {
      do: ({ to }) => setCount(to),
      undo: ({ from }) => setCount(from),
    },
    divide: {
      do: ({ to }) => setCount(to),
      undo: ({ from }) => setCount(from),
    },
  });
  return (
    <>
      <div>count = {count}</div>
      <div style={btnContainerStyle}>
        <button onClick={() => multiply({ from: count, to: count * Math.PI })}>
          multiPI
        </button>
        <button onClick={() => divide({ from: count, to: count / Math.PI })}>
          diPide
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
