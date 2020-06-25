import React, { FC, useState } from 'react';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { useFlexibleUndo } from '../../.';

interface PayloadByType {
  add: number;
  subtract: number;
}

export const DeltaPayloadBasic: FC = () => {
  const [count, setCount] = useState(0);

  const { undoables, canUndo, undo, canRedo, redo } = useFlexibleUndo<
    PayloadByType
  >({
    handlers: {
      add: {
        drdo: amount => setCount(prev => prev + amount),
        undo: amount => setCount(prev => prev - amount),
      },
      subtract: {
        drdo: amount => setCount(prev => prev - amount),
        undo: amount => setCount(prev => prev + amount),
      },
    },
  });

  const { add, subtract } = undoables;

  return (
    <div className={rootStyle}>
      <div className={topUIStyle}>
        <div className={countStyle}>count = {count}</div>
        <div className={actionsStyle}>
          <button onClick={() => add(2)}>add 2</button>
          <button onClick={() => subtract(1)}>subtract 1</button>
          <button disabled={!canUndo} onClick={() => undo()}>
            undo
          </button>
          <button disabled={!canRedo} onClick={() => redo()}>
            redo
          </button>
        </div>
      </div>
    </div>
  );
};
