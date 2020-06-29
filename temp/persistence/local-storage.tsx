import React, { FC, useState, useEffect } from 'react';
import {
  PayloadFromTo,
  useFlexibleUndo,
  makeUndoableFTHandler,
  makeUndoableHandler,
  invertHandlers,
} from '../../dist';
import { rootClass, uiContainerClass } from '../../stories/styles';
import { ActionList } from '../../stories/components/action-list';
import { NumberInput } from '../../stories/components/number-input';
import { reviver } from './reviver';

type Nullber = number | null;

interface PayloadByType {
  add: number;
  subtract: number;
  updateAmount: PayloadFromTo<Nullber>;
}

const localStorageKey = 'ufu-local-storage-example';

export const LocalStorageExample: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<Nullber>(1);
  const [startTime, setStartTime] = useState<Date>(new Date());

  const {
    makeUndoables,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
    setStack,
  } = useFlexibleUndo<PayloadByType>();

  const undoableAddHandler = makeUndoableHandler(setCount)(
    amount => prev => prev + amount,
    amount => prev => prev - amount
  );

  const { add, subtract, updateAmount } = makeUndoables<PayloadByType>({
    add: undoableAddHandler,
    subtract: invertHandlers(undoableAddHandler),
    updateAmount: makeUndoableFTHandler(setAmount),
  });

  useEffect(() => {
    try {
      const data = localStorage.getItem(localStorageKey);
      if (data) {
        const parsed = JSON.parse(data, reviver);
        setStartTime(parsed.startTime);
        setStack(parsed.stack);
        setCount(parsed.count);
        setAmount(parsed.amount);
      }
    } catch (error) {
      console.log(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // optionally throttle this
    try {
      localStorage.setItem(
        localStorageKey,
        JSON.stringify({
          count,
          amount,
          stack,
          startTime,
        })
      );
    } catch (error) {
      console.log(error);
    }
  }, [amount, count, stack, startTime]);

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
        history={stack}
        timeTravel={timeTravel}
        startTime={startTime}
      />
    </div>
  );
};
