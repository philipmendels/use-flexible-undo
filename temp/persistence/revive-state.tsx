import React, { FC, useState, useEffect, useRef } from 'react';
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

const localStorageKey = 'ufu-revive-state-example';

export const ReviveStateExample: FC = () => {
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

  const reviveToIndexRef = useRef(0);

  // LOAD ON STARTUP
  useEffect(() => {
    try {
      const data = localStorage.getItem(localStorageKey);
      if (data) {
        const parsed: {
          startTime: typeof startTime;
          stack: typeof stack;
        } = JSON.parse(data, reviver);
        setStartTime(parsed.startTime);
        const parsedStack = parsed.stack;
        reviveToIndexRef.current = parsedStack.future.length;
        setStack({
          past: [],
          future: [...parsedStack.future, ...parsedStack.past],
        });
      }
    } catch (error) {
      console.log(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // REVIVE STATE
  useEffect(() => {
    if (reviveToIndexRef.current !== 0 && stack.future.length !== 0) {
      timeTravel('future', reviveToIndexRef.current);
      reviveToIndexRef.current = 0;
    }
  }, [timeTravel, stack]);

  // AUTO SAVE
  useEffect(() => {
    try {
      localStorage.setItem(
        localStorageKey,
        JSON.stringify({
          startTime,
          stack,
        })
      );
    } catch (error) {
      console.log(error);
    }
  }, [stack, startTime]);

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
