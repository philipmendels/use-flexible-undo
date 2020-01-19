import React, { useState } from 'react';
import { useInfiniteUndo } from '../src';
import { btnContainerStyle } from './styles';
import { PayloadFromTo } from '../src/index.types';

type Payload = PayloadFromTo<number>;

export const MakeUndoableFromTo: React.FC = () => {
  const [count, setCount] = useState(1);
  const { makeUndoable, canUndo, undo, canRedo, redo } = useInfiniteUndo();
  const multiply = makeUndoable<Payload>({
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
