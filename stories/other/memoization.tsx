import React, { FC, useState, useEffect } from 'react';
import {
  useFlexibleUndo,
  invertHandlers,
  makeUndoableHandler,
  UFUOptions,
  UndoableHandlersByType,
  PayloadFromTo,
  makeUndoableFTObjHandler,
} from '../../.';
import { ActionList } from '../components/action-list';
import { rootClass, uiContainerClass } from '../styles';
import { useMemo } from '@storybook/addons';
import { NumberInput } from '../components/number-input';

type Nullber = number | null;

interface PayloadByType {
  add: number;
  subtract: number;
  updateAmount: PayloadFromTo<Nullber>;
}

// Define the options outside of the component,
// or if they are dynamic them then wrap them in useMemo.
const options: UFUOptions = {
  clearFutureOnDo: false,
};

export const MakeUndoableHandlerExample: FC = () => {
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
      updateAmount: makeUndoableFTObjHandler(setAmount),
    };
  }, []);

  const {
    undoables,
    canUndo,
    undo,
    canRedo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useFlexibleUndo({
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
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
        <label>
          amount:&nbsp;
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
        <button disabled={!canUndo} onClick={() => undo()}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => redo()}>
          redo
        </button>
      </div>
      <ActionList
        history={history}
        timeTravel={timeTravel}
        switchToBranch={switchToBranch}
      />
    </div>
  );
};
