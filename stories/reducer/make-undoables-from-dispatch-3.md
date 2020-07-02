Full code:

```typescript
import React, { FC, useState } from 'react';
import {
  useFlexibleUndo,
  makeUndoableReducer,
  makeUndoableFTHandler,
  invertHandlers,
  useUndoableReducer,
  makeUndoablePartialStateUpdater,
} from '../../.';
import { merge } from '../examples-util';
import { topUIStyle, rootStyle, countStyle, actionsStyle } from '../styles';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';
import { ActionList } from '../components/action-list';

interface State {
  count: number;
}

interface PBT_Reducer {
  add: number;
  subtract: number;
}

const undoableAddHandler = makeUndoablePartialStateUpdater(
  (amount: number) => () => amount,
  (state: State) => state.count,
  count => merge({ count })
)(
  amount => prev => prev + amount,
  amount => prev => prev - amount
);

const { reducer, actionCreators } = makeUndoableReducer<State, PBT_Reducer>({
  add: undoableAddHandler,
  subtract: invertHandlers(undoableAddHandler),
});

export const MakeUndoablesFromDispatchExample3: FC = () => {
  const [{ count }, handlers] = useUndoableReducer(
    reducer,
    { count: 0 },
    actionCreators
  );
  const [amount, setAmount] = useState<number | null>(1);

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useFlexibleUndo({
    handlers: {
      ...handlers,
      updateAmount: makeUndoableFTHandler(setAmount),
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
