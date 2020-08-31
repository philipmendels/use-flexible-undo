### useBoundUnducer and useState - Readme & Code

Just as you can use the results of separate calls to useState inside you do/redo & undo handlers, you can also combine separate calls to useState and useReducer (in this example wrapped by useBoundUnducer). It may not necessarily be a good idea, but you can.

```typescript
import React, { FC, useState } from 'react';
import {
  useUndoableEffects,
  makeUnducer,
  makeUndoableFTHandler,
  invertHandlers,
  makeUndoableUpdater,
  useBindUndoableActionCreators,
} from 'use-flexible-undo';
import { merge, addUpdater, subtractUpdater } from '../examples-util';
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

const selectAmount = (amount: number) => () => amount;

const undoableAddUpdater = makeUndoableUpdater(
  (state: State) => state.count,
  count => merge({ count })
)(selectAmount)(addUpdater, subtractUpdater);

const { unducer, actionCreators } = makeUnducer<State, PBT_Reducer>({
  add: undoableAddUpdater,
  subtract: invertHandlers(undoableAddUpdater),
});

export const ReducerAndUseStateExample: FC = () => {
  const [{ count }, handlers] = useBindUndoableActionCreators({
    unducer,
    initialState: { count: 0 },
    actionCreators,
  });
  const [amount, setAmount] = useState<number | null>(1);

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects({
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
