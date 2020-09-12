import React, { FC, useState, useEffect } from 'react';
import {
  useUndoableEffects,
  makeUndoableFTHandler,
  makeUndoableHandler,
  invertHandlers,
} from 'use-flexible-undo';
import { addUpdater, subtractUpdater } from '../examples-util';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { ActionList } from '../components/action-list';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';
import { reviver } from './reviver';

const localStorageKey = 'ufu-local-storage-example';

export const LocalStorageExample: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<number | null>(1);

  const undoableAddHandler = makeUndoableHandler(setCount)(
    addUpdater,
    subtractUpdater
  );

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
    setHistory,
  } = useUndoableEffects({
    handlers: {
      add: undoableAddHandler,
      subtract: invertHandlers(undoableAddHandler),
      updateAmount: makeUndoableFTHandler(setAmount),
    },
  });

  const { add, subtract, updateAmount } = undoables;

  // LOAD ON STARTUP
  useEffect(() => {
    console.log('--- INIT localStorage example ---');
    console.log('Load app state and history state from localStorage');
    try {
      const data = localStorage.getItem(localStorageKey);
      if (data) {
        const parsed = JSON.parse(data, reviver);
        setHistory(parsed.history);
        setCount(parsed.count);
        setAmount(parsed.amount);
      }
    } catch (error) {
      console.log(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AUTO SAVE ON CHANGE
  useEffect(() => {
    console.log('Save app state and history state to localStorage');
    try {
      localStorage.setItem(
        localStorageKey,
        JSON.stringify({
          count,
          amount,
          history,
        })
      );
    } catch (error) {
      console.log(error);
    }
  }, [amount, count, history]);

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
