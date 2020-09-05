import React, { FC, useState, useRef, useEffect } from 'react';
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

const localStorageKey = 'ufu-revive-state-example';

export const ReviveStateExample: FC = () => {
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

  const indexToRestoreRef = useRef(0);

  // LOAD ON STARTUP
  useEffect(() => {
    try {
      const data = localStorage.getItem(localStorageKey);
      if (data) {
        const hist: typeof history = JSON.parse(data, reviver);
        indexToRestoreRef.current = hist.currentPosition.globalIndex;
        hist.currentPosition.globalIndex = 0;
        setHistory(hist);
      }
    } catch (error) {
      console.log(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // REVIVE STATE
  useEffect(() => {
    if (
      indexToRestoreRef.current !== 0 &&
      history.branches[history.currentBranchId].stack.length !== 0
    ) {
      timeTravel(indexToRestoreRef.current);
      indexToRestoreRef.current = 0;
    }
  }, [timeTravel, history.branches, history.currentBranchId]);

  // AUTO SAVE
  useEffect(() => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(history));
    } catch (error) {
      console.log(error);
    }
  }, [history]);

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
