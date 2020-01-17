import React, { useState } from 'react';
import { useInfiniteUndo } from '../src';

export const Basic: React.FC = () => {
  const [count, setCount] = useState(0);
  const { makeUndoable, canUndo, undo, canRedo, redo } = useInfiniteUndo();
  const add = makeUndoable<number>({
    type: 'add',
    do: amount => setCount(prev => prev + amount),
    undo: amount => setCount(prev => prev - amount),
  });
  return (
    <>
      <div>count = {count}</div>
      <div style={btnContainerStyle}>
        <button onClick={() => add(1)}>add 1</button>
        <button disabled={!canUndo()} onClick={() => undo()}>
          undo
        </button>
        <button disabled={!canRedo()} onClick={() => redo()}>
          redo
        </button>
      </div>
    </>
  );
};

const btnContainerStyle = {
  marginTop: '20px',
  width: '150px',
  display: 'flex',
  justifyContent: 'space-between',
};
