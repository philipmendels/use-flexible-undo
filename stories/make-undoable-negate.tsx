import React, { FC, useState } from 'react';
import { useFlexibleUndo } from '../.';
import { ActionList } from './components/action-list';
import { rootClass, uiContainerClass } from './styles';

export const MakeUndoableNegate: FC = () => {
  const [count, setCount] = useState(0);

  const {
    makeUndoable,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useFlexibleUndo();

  const add = makeUndoable<number>({
    type: 'add',
    drdo: amount => setCount(prev => prev + amount),
    undo: amount => setCount(prev => prev - amount),
  });

  const subtract = (amount: number) => add(-amount);

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
        <button onClick={() => add(1)}>add 1</button>
        <button onClick={() => subtract(2)}>subtract 2</button>
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
