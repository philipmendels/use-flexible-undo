### useBindUndoableActionCreators - Readme & Code

The hook **useBindUndoableActionCreators** is a basic wrapper for useReducer and bindUndoableActionCreators. It takes a reducer, the initial state and an object with do/redo & undo action creators by action type. It returns (in a tuple) the current state and an object with do/redo & undo handlers by action type. This handlers object is memoized inside the hook, and can be passed to the "handlers" prop of **useUndoableEffects**.

```typescript
import React, { FC } from 'react';
import {
  useUndoableEffects,
  makeUnducer,
  PayloadFromTo,
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

type Nullber = number | null;

interface State {
  count: number;
  amount: Nullber;
}

interface PayloadByType {
  add: void;
  subtract: void;
  updateAmount: PayloadFromTo<Nullber>;
}

const selectAmount = (_: void) => (state: State) => state.amount || 0;

const undoableAddUpdater = makeUndoableUpdater(
  (state: State) => state.count,
  count => merge({ count })
)(selectAmount)(addUpdater, subtractUpdater);

const { unducer, actionCreators } = makeUnducer<State, PayloadByType>({
  add: undoableAddUpdater,
  subtract: invertHandlers(undoableAddUpdater),
  updateAmount: makeUndoableFTHandler(amount => merge({ amount })),
});

export const useBindUndoableActionCreatorsExample: FC = () => {
  const [{ count, amount }, handlers] = useBindUndoableActionCreators({
    unducer,
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
