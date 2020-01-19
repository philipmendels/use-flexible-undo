import React, { useState } from 'react';
import { useInfiniteUndo } from '../src';
import { btnContainerStyle } from './styles';
import { PayloadTupleFromTo } from '../src/index.types';

type Payload = PayloadTupleFromTo<number>;

export const MakeUndoableFromToTuple: React.FC = () => {
  const [count, setCount] = useState(1);
  const { makeUndoable, canUndo, undo, canRedo, redo } = useInfiniteUndo();
  const multiply = makeUndoable<Payload>({
    type: 'multiply',
    do: ([to]) => setCount(to),
    undo: ([_, from]) => setCount(from),
  });
  return (
    <>
      <div>count = {count}</div>
      <div style={btnContainerStyle}>
        <button onClick={() => multiply([count, count / Math.PI])}>
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
