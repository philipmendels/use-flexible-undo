### Previous state and payload - Readme & Code

```typescript
import React, { FC, useState } from 'react';
import {
  useFlexibleUndo,
  makeUndoableFTHandler,
  invertHandlers,
  makeUndoablePartialStateHandler,
} from 'use-flexible-undo';
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

export const PreviousStateAndPayloadExample: FC = () => {
  const [{ count, amount }, setState] = useState<State>({
    count: 0,
    amount: 1,
  });

  const undoableAddHandler = makeUndoablePartialStateHandler(
    setState,
    (shouldDouble: boolean) => ({ amount }) =>
      amount ? (shouldDouble ? amount * 2 : amount) : 0,
    state => state.count,
    count => merge({ count })
  )(
    amount => prev => prev + amount,
    amount => prev => prev - amount
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
          <button disabled={!amount} onClick={() => add(false)}>
            add
          </button>
          <button disabled={!amount} onClick={() => add(true)}>
            add x 2
          </button>
          <button disabled={!amount} onClick={() => subtract(false)}>
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
