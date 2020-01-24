import React, { useState } from 'react';
import { useInfiniteUndo } from '../src';
import { btnContainerStyle } from './styles';
import { PayloadFromTo } from '../src/index.types';

type Payload = PayloadFromTo<number>;

export const MakeUndoableFromTo: React.FC = () => {
  const [count, setCount] = useState(1);

  const {
    makeUndoable,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
  } = useInfiniteUndo();

  const updateCount = makeUndoable<Payload>({
    type: 'updateCount',
    do: ({ to }) => setCount(to),
    undo: ({ from }) => setCount(from),
  });

  const multiply = (amount: number) =>
    updateCount({ from: count, to: count * amount });
  const divide = (amount: number) =>
    updateCount({ from: count, to: count / amount });

  return (
    <>
      <div>count = {count}</div>
      <div style={btnContainerStyle}>
        <button onClick={() => multiply(Math.PI)}>multiPI</button>
        <button onClick={() => divide(Math.PI)}>diPIde</button>
        <button disabled={!canUndo} onClick={() => undo()}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => redo()}>
          redo
        </button>
      </div>
      {stack.future.map((action, index) => (
        <div key={index} style={{ color: '#CCC' }}>
          <div key={index}>{JSON.stringify(action)}</div>
        </div>
      ))}
      {stack.past.map((action, index) => (
        <div key={index}>{JSON.stringify(action)}</div>
      ))}
    </>
  );
};
