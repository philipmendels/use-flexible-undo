### Memoization - Readme & Code

The hook **useUndoableEffects** converts the do/redo and undo handlers to undoable functions. This conversion will happen every render if the **handlers** object reference is not stable (e.g. if you create the object inline). If you want to avoid this, in order to improve performance and/or if you want the **undoables** object returned by the hook to be referentially stable, then you can memoize the **handlers** object with React's **useMemo**.

Wrapping the handlers in useMemo has the additional benefit that if you erroneously create a direct dependency on state in your handlers, you will notice this because eslint-plugin-react-hooks will ask you to add the dependency to the dependency array. Instead of doing that you should fix it by moving the dependency to the action payload or the previous state. See [this story](./?path=/story/useundoableeffects-dependent-state--don-t-do-this) for more explanation.

It is _not_ necessary to memoize the **options** object. If your options are constant (i.e. if the user can not change them through the UI) you can define them outside of the function component, but that will require additional typing if you use TypeScript.

```typescript
import React, { FC, useState, useEffect, useMemo } from 'react';
import {
  useUndoableEffects,
  makeUndoableHandler,
  invertHandlers,
  makeUndoableFTHandler,
} from 'use-flexible-undo';

import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';
import { ActionList } from '../components/action-list';

export const MemoizationExample: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<number | null>(1);

  const handlers = useMemo(() => {
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
    handlers,
    options: {
      // options do not need to be memoized / extracted
      clearFutureOnDo: false,
    },
  });

  useEffect(() => {
    console.log('--- INIT memoization example ---');
  }, []);

  useEffect(() => {
    console.log('component render');
  });

  // Just for checking that memoization works.
  // Effect should only run once instead of every render.
  useEffect(() => {
    console.log('undoables changed');
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
```
