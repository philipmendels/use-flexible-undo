### useBoundUnducer with previous state and payload - Readme & Code

You are free to obtain your state dependencies from the previous state, or from the action payload, or from a combination of the two. In this somewhat contrived :) example "shouldDouble" is not part of state (there is a dedicated button for "add x 2"), hence we simply pass a static boolean value as the action payload.

```typescript
import React, { FC } from 'react';
import {
  useUndoableEffects,
  makeUnducer,
  PayloadFromTo,
  invertHandlers,
  makeUndoableFTHandler,
  useBoundUnducer,
  makeUndoableUpdater,
} from 'use-flexible-undo';
import { merge, addUpdater, subtractUpdater } from '../examples-util';
import { topUIStyle, rootStyle, countStyle, actionsStyle } from '../styles';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';
import { ActionList } from '../components/action-list';

type Nullber = number | null;

interface State {
  count: number;
  amount: Nullber;
}

interface PayloadByType {
  add: boolean;
  subtract: boolean;
  updateAmount: PayloadFromTo<Nullber>;
}

const undoableAddHandler = makeUndoableUpdater(
  (state: State) => state.count,
  count => merge({ count })
)((shouldDouble: boolean) => ({ amount }) =>
  amount ? (shouldDouble ? amount * 2 : amount) : 0
)(addUpdater, subtractUpdater);

const { reducer, actionCreators } = makeUnducer<State, PayloadByType>({
  add: undoableAddHandler,
  subtract: invertHandlers(undoableAddHandler),
  updateAmount: makeUndoableFTHandler(amount => merge({ amount })),
});

export const ReducerWithPreviousStateAndPayloadExample: FC = () => {
  const [{ count, amount }, handlers] = useBoundUnducer({
    reducer,
    initialState: {
      count: 0,
      amount: 1,
    },
    actionCreators,
  });

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects({
    handlers,
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
