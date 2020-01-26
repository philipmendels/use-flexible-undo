import React, { useState } from 'react';
import { useInfiniteUndo } from '../src';
import { btnContainerStyle } from './styles';
import { Stack } from './components/stack';

export const MakeUndoableDelta: React.FC = () => {
  const [count, setCount] = useState(0);

  const {
    makeUndoable,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useInfiniteUndo();

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
        <button disabled={!canUndo} onClick={() => undo()}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => redo()}>
          redo
        </button>
      </div>
      <Stack stack={stack} timeTravel={timeTravel} />
    </>
  );
};
