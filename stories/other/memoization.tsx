import React, { FC, useState, useEffect, useMemo } from 'react';
import {
  useUndoableEffects,
  invertHandlers,
  makeUndoableHandler,
  UFUOptions,
  UndoableHandlersByType,
  PayloadFromTo,
  makeUndoableFTHandler,
} from 'use-flexible-undo';

import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';
import { ActionList } from '../components/action-list';

type Nullber = number | null;

interface PayloadByType {
  add: number;
  subtract: number;
  updateAmount: PayloadFromTo<Nullber>;
}

// Define constant options outside of the component.
// It they are dynamic (stateful) then wrap them
// in useMemo just like the handlers below.
const options: UFUOptions = {
  clearFutureOnDo: false,
};

export const MemoizationExample: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<Nullber>(1);

  const handlers: UndoableHandlersByType<PayloadByType> = useMemo(() => {
    const undoableAddHandler = makeUndoableHandler(setCount)(
      amount => prev => prev + amount,
      amount => prev => prev - amount
    );
    return {
      add: undoableAddHandler,
      subtract: invertHandlers(undoableAddHandler),
      updateAmount: makeUndoableFTHandler(setAmount),
    };
  }, []);

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects({
    // No need to add the payload types,
    // they will be inferred from the handlers.
    handlers,
    options,
  });

  // Just for checking that memoization works.
  // Effect should only run once instead of every render.
  useEffect(() => {
    console.log('undoables changed', undoables);
  }, [undoables]);

  const { add, subtract, updateAmount } = undoables;

  return (
    <div className={rootStyle}>
      <div className={topUIStyle}>
        <div className={countStyle}>count &nbsp;= &nbsp;{count}</div>
        <div className={actionsStyle}>
          <label>
            amount =&nbsp;
            <NumberInput
              value={amount}
              onChange={value =>
                updateAmount({
                  from: amount,
                  to: value,
                })
              }
            />
          </label>
          <button disabled={!amount} onClick={() => amount && add(amount)}>
            add
          </button>
          <button disabled={!amount} onClick={() => amount && subtract(amount)}>
            subtract
          </button>
        </div>
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
