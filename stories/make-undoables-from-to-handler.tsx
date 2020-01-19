import React, { useState } from 'react';
import { useInfiniteUndo } from '../src';
import { btnContainerStyle } from './styles';
import { PayloadFromTo } from '../src/index.types';
import { makeUndoableFromToHandler } from '../src/util';

type Payload = PayloadFromTo<number>;

export const MakeUndoablesFromToHandler: React.FC = () => {
  const [count, setCount] = useState(1);

  const { makeUndoable, canUndo, undo, canRedo, redo } = useInfiniteUndo();

  const updateCount = makeUndoable<Payload>({
    type: 'updateCount',
    ...makeUndoableFromToHandler(setCount),
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
    </>
  );
};
