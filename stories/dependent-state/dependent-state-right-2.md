As an alternative to passing dependent state as (part of) the action payload, you can store all dependent state together and get it from the previous state in your do/redo and undo handlers. Here we use useState to store our state, in later examples we take a look at useReducer.

```typescript
import React, { FC, useState } from 'react';
import {
  useFlexibleUndo,
  makeUndoableFTHandler,
  makeUndoableHandler,
  invertHandlers,
} from '../../.';
import { merge } from '../examples-util';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { ActionList } from '../components/action-list';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';

type Nullber = number | null;

interface State {
  count: number;
  amount: Nullber;
}

export const DependentStateRight2Example: FC = () => {
  const [{ count, amount }, setState] = useState<State>({
    count: 0,
    amount: 1,
  });

  const undoableAddHandler = makeUndoableHandler(setState)<void>(
    () => prev =>
      prev.amount ? { ...prev, count: prev.count + prev.amount } : prev,
    () => prev =>
      prev.amount ? { ...prev, count: prev.count - prev.amount } : prev
  );

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useFlexibleUndo({
    handlers: {
      add: undoableAddHandler,
      subtract: invertHandlers(undoableAddHandler),
      updateAmount: makeUndoableFTHandler((amount: Nullber) =>
        setState(merge({ amount }))
      ),
    },
  });

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
          <button disabled={!amount} onClick={() => add()}>
            add
          </button>
          <button disabled={!amount} onClick={() => subtract()}>
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
