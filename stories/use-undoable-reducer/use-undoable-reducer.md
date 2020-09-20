### makeUndoableReducer & useUndoableReducer - Readme & code

If you want to keep your undo-history state and you application state integrated, and/or if you want to extract your state update logic from your component(s) for various reasons (e.g. performance, testing, seperation of concerns), then you can create a reducer from scratch or with the included utils. You can pass this reducer together with an object map of undo action creators by action type to **makeUndoableReducer**. The resulting undoable reducer can be used directly with React's useReducer, or you can provide it to **useUndoableReducer**. This is a simple wrapper for useReducer, and it gives you a similar API as **useUndoableEffects**.

See the documentation for **useUndoableEffects** for an explanation about the other utility functions, the return values of the hook, constructing the UI and various other topics.

```typescript
import React, { FC } from 'react';
import {
  PayloadFromTo,
  makeUpdater,
  makeFTHandler,
  invertFTHandler,
  makeReducer,
  makeUndoableReducer,
  useUndoableReducer,
} from 'use-flexible-undo';
import { merge, addUpdater, subtractUpdater } from '../examples-util';
import { topUIStyle, rootStyle, countStyle, actionsStyle } from '../styles';
import { NumberInput } from '../components/number-input';
import { ActionList } from '../components/action-list';
import { BranchNav } from '../components/branch-nav';

type Nullber = number | null;

interface State {
  count: number;
  amount: Nullber;
}

interface PayloadByType {
  add: number;
  subtract: number;
  updateAmount: PayloadFromTo<Nullber>;
}

// Here we get "amount" from the payload. Alternatively you can get it
// from the previous state, but then you will not have access to the
// value when constructing the UI for the undo history.
const selectDependency = (amount: number) => () => amount;

const countUpdater = makeUpdater(
  (state: State) => state.count,
  count => merge({ count })
)(selectDependency);

const { reducer, actionCreators } = makeReducer<State, PayloadByType>({
  add: countUpdater(addUpdater),
  subtract: countUpdater(subtractUpdater),
  updateAmount: makeFTHandler(amount => merge({ amount })),
});

const undoableReducer = makeUndoableReducer(reducer, {
  add: actionCreators.subtract,
  subtract: actionCreators.add,
  updateAmount: invertFTHandler(actionCreators.updateAmount),
});

export const UseUndoableReducerExample: FC = () => {
  const {
    state,
    history,
    undoables,
    undo,
    redo,
    timeTravel,
    switchToBranch,
  } = useUndoableReducer({
    undoableReducer,
    initialState: {
      count: 0,
      amount: 1,
    },
    actionCreators,
  });

  const { count, amount } = state;

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
