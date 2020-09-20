### reducer & makeUpdater - Readme & Code

If you want to extract your state update logic from your component(s) for various reasons (e.g. performance, testing, seperation of concerns), then you can create a reducer. Here we create the reducer from scratch. You can see in this example that there is some repetition between the definition of the reducer and the definition of the handlers (the action types are repeated). In the next examples we take a look at utilities for removing this repetition.

In this example we use the curried utility function **makeUpdater**, which takes

- a function for selecting slice B from state A.
- a function for updating slice B in state A.  
  ->
- a function P -> A -> C for deriving a state change value C based on the action payload and/or the previous state A
- an optional predicate function P -> A -> boolean, for conditionally applying the entire update  
  ->
- a curried updater function C -> B -> B for the do/redo handler or for the undo handler

Again this may not be a one-size-fits-all utility. Feel free to write your own solution, for example using lenses and other functional utilities.

```typescript
import React, { FC, useReducer } from 'react';
import {
  useUndoableEffects,
  PayloadFromTo,
  Reducer,
  invertHandlers,
  invertFTHandler,
  makeUpdater,
} from 'use-flexible-undo';
import { merge, addUpdater, subtractUpdater } from '../examples-util';
import { ActionList } from '../components/action-list';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';

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

const countUpdater = makeUpdater(
  (state: State) => state.count,
  count => merge({ count })
)(selectAmount);

const reducer: Reducer<State, PayloadByType> = (prevState, action) => {
  switch (action.type) {
    case 'add':
      return countUpdater(addUpdater)()(prevState);
    case 'subtract':
      return countUpdater(subtractUpdater)()(prevState);
    case 'updateAmount':
      return { ...prevState, amount: action.payload.to };
    default:
      return prevState;
  }
};

export const ReducerAndMakeUpdaterExample: FC = () => {
  const [{ count, amount }, dispatch] = useReducer(reducer, {
    count: 0,
    amount: 1,
  });

  const addHandlers = {
    drdo: () => dispatch({ type: 'add' }),
    undo: () => dispatch({ type: 'subtract' }),
  };

  const updateAmountHandler = (payload: PayloadFromTo<Nullber>) =>
    dispatch({ type: 'updateAmount', payload });

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects<PayloadByType>({
    handlers: {
      add: addHandlers,
      subtract: invertHandlers(addHandlers),
      updateAmount: {
        drdo: updateAmountHandler,
        undo: invertFTHandler(updateAmountHandler),
      },
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
