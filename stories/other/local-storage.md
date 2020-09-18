### setHistory from localStorage - Readme & Code

You can use the **setHistory** function which is returned by the hook to dynamically restore (or update) the history state. Make sure to restore your application state as well to keep the state in sync. Alternatively you can recreate your application state from the history state (see next example), but that requires your initial application state to be constant inbetween save and load, if you modelled (some of) your action payloads as relative values (deltas).

When your application state grows and you find it incovenient to access and update each slice of application state individually when saving and loading, you can opt to create a combined state object with useState (in this case combining "count" and "amount"). If you also want to integrate the history state then take a look at **useUndoableReducer**.

```typescript
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
```
