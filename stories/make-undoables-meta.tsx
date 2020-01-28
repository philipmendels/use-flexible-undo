import React, { useState } from 'react';
import { useInfiniteUndo } from '../src';
import { btnContainerClass } from './styles';

interface PayloadByType {
  add: number;
  subtract: number;
}

interface MetaActionReturnTypes {
  describe: string;
}

export const MakeUndoablesMeta: React.FC = () => {
  const [count, setCount] = useState(0);
  const { makeUndoables, canUndo, undo, canRedo, redo } = useInfiniteUndo<
    PayloadByType,
    MetaActionReturnTypes
  >({
    onDo: ({ meta }) => console.log(meta.describe()),
  });

  const { add, subtract } = makeUndoables<PayloadByType>({
    add: {
      do: amount => setCount(prev => prev + amount),
      undo: amount => setCount(prev => prev - amount),
      meta: {
        describe: amount => `Increase count by ${amount}`,
      },
    },
    subtract: {
      do: amount => setCount(prev => prev - amount),
      undo: amount => setCount(prev => prev + amount),
      meta: {
        describe: amount => `Decrease count by ${amount}`,
      },
    },
  });
  return (
    <>
      <div>count = {count}</div>
      <div className={btnContainerClass}>
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
