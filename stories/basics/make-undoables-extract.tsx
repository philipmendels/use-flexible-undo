import React, { FC, useState } from 'react';
import { useFlexibleUndo } from '../../.';
import { rootClass, uiContainerClass } from '../styles';

interface PayloadByType {
  add: number;
  subtract: number;
}

export const MakeUndoablesExtract: FC = () => {
  const [count, setCount] = useState(0);

  const { makeUndoables, canUndo, undo, canRedo, redo } = useFlexibleUndo();

  const addHandler = (amount: number) => setCount(prev => prev + amount);
  const subHandler = (amount: number) => setCount(prev => prev - amount);

  const { add, subtract } = makeUndoables<PayloadByType>({
    add: {
      drdo: addHandler,
      undo: subHandler,
    },
    subtract: {
      drdo: subHandler,
      undo: addHandler,
    },
  });

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
      {/* <ActionList history={stack} timeTravel={timeTravel} /> */}
    </div>
  );
};
