import React, { useState } from 'react';
import { useInfiniteUndo } from '../src';
import { btnContainerClass, rootClass } from './styles';
import { PayloadFromTo } from '../src/index.types';
import { ActionList } from './components/action-list';

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
    timeTravel,
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
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={btnContainerClass}>
        <button onClick={() => multiply(Math.PI)}>multiPI</button>
        <button onClick={() => divide(Math.PI)}>diPIde</button>
        <button disabled={!canUndo} onClick={() => undo()}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => redo()}>
          redo
        </button>
      </div>
      <ActionList stack={stack} timeTravel={timeTravel} />
    </div>
  );
};
