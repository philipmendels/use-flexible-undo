import React, { useState } from 'react';
import { useUndoableEffects, PayloadFromTo } from '../../src';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { BranchNav } from '../components/branch-nav';
import { ActionList } from '../components/action-list';

// action Payload By action Type
interface PBT {
  // an object with 'from' and 'to' fields of type number:
  updateCount: PayloadFromTo<number>;
  mult: number;
}

export const SkipExample: React.FC = () => {
  const [count, setCount] = useState(0);

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
    skip,
  } = useUndoableEffects<PBT>({
    handlers: {
      updateCount: {
        drdo: ({ to }) => setCount(to),
        undo: ({ from }) => setCount(from),
      },
      mult: {
        drdo: amount => setCount(prev => prev * amount),
        undo: amount => setCount(prev => prev / amount),
      },
    },
    migrators: {
      updateCount: ({ to }) => {
        return { from: count, to };
      },
    },
  });

  const { updateCount, mult } = undoables;

  const add = (amount: number) =>
    updateCount({ from: count, to: count + amount });
  const subtract = (amount: number) =>
    updateCount({ from: count, to: count - amount });
  // const multiply = (amount: number) =>
  //   updateCount({ from: count, to: count * amount });
  const divide = (amount: number) =>
    updateCount({ from: count, to: count / amount });

  const val = 2;

  return (
    <div className={rootStyle}>
      <div className={topUIStyle}>
        <div className={countStyle}>count = {count}</div>
        <div className={actionsStyle}>
          <button onClick={() => add(val)}>add 2</button>
          <button onClick={() => subtract(val)}>subtract 2</button>
          <button onClick={() => mult(val)}>multiply by 2</button>
          <button onClick={() => divide(val)}>divide by 2</button>
        </div>
        <button onClick={() => skip()}>skip selected action</button>
        <BranchNav
          history={history}
          switchToBranch={switchToBranch}
          undo={undo}
          redo={redo}
        />
      </div>
      <ActionList
        history={history}
        timeTravel={timeTravel}
        switchToBranch={switchToBranch}
      />
    </div>
  );
};
