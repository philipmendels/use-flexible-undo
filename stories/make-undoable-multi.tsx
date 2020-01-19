import React, { useState } from 'react';
import { useInfiniteUndo } from '../src';
import { btnContainerStyle } from './styles';

export const MakeUndoableMulti: React.FC = () => {
  const [count, setCount] = useState(0);

  const { makeUndoable, canUndo, undo, canRedo, redo } = useInfiniteUndo();

  const add = makeUndoable<number>({
    type: 'add',
    do: amount => setCount(prev => prev + amount),
    undo: amount => setCount(prev => prev - amount),
  });
  const subtract = makeUndoable<number>({
    type: 'subtract',
    do: amount => setCount(prev => prev - amount),
    undo: amount => setCount(prev => prev + amount),
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
