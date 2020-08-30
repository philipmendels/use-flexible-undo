### Reducer & makeUndoableUpdater - Readme & Code

The utility **makeUndoableUpdater** is similar to **makeUndoableSetter** which was explained in the previous chapter about "dependent state". The difference is that it does not take the initial state setter function, and consequently it does not set the state, but returns do/redo & undo state updater functions that you can use in a reducer. Again this may not be a one-size-fits-all solution. Feel free to write your own solution, for example using lenses and other functional utilities.

In this example you can see that manually writing a reducer and calling dispatch from the handlers involves writing a lot of repetitive code. We could optimize the code a bit by leaving out the "subtract" case from the reducer, and simply using the inverse of the "add" handler for the "subtract" handler (e.g. using the **invertHandlers** util which is explained in the first chapter). But this would only bring us so far. In the next examples we look at some utilities for removing more repetitive code.

```typescript
import React, { FC, useReducer } from 'react';
import { useUndoableEffects, PayloadFromTo, Unducer } from 'use-flexible-undo';
import { merge, addUpdater, subtractUpdater } from '../examples-util';
import { ActionList } from '../components/action-list';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';
import { makeUndoableUpdater } from '../../src';

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

const undoableAddUpdater = makeUndoableUpdater(
  (state: State) => state.count, // getter
  count => merge({ count }) // setter
)(
  (_: void) => state => state.amount || 0, // dependency selector
  () => state => Boolean(state.amount) // condition
)(addUpdater, subtractUpdater);

const unducer: Unducer<State, PayloadByType> = (prevState, action) => {
  const isUndo = action.meta?.isUndo;
  switch (action.type) {
    case 'add':
      return isUndo
        ? undoableAddUpdater.undo()(prevState)
        : undoableAddUpdater.drdo()(prevState);
    case 'subtract':
      return isUndo
        ? undoableAddUpdater.drdo()(prevState)
        : undoableAddUpdater.undo()(prevState);
    case 'updateAmount':
      const { from, to } = action.payload;
      return { ...prevState, amount: isUndo ? from : to };
    default:
      return prevState;
  }
};

const makeHandlers = <R extends unknown>(fn: (isUndo: boolean) => R) => ({
  drdo: fn(false),
  undo: fn(true),
});

export const UnducerAndMakeUndoableUpdaterExample: FC = () => {
  const [{ count, amount }, dispatch] = useReducer(unducer, {
    count: 0,
    amount: 1,
  });

  const makeAddHandler = (isUndo: boolean) => () =>
    dispatch({ type: 'add', meta: { isUndo } });

  const makeSubtractHandler = (isUndo: boolean) => () =>
    dispatch({ type: 'subtract', meta: { isUndo } });

  const makeUpdateAmountHandler = (isUndo: boolean) => (
    payload: PayloadFromTo<Nullber>
  ) => dispatch({ type: 'updateAmount', payload, meta: { isUndo } });

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects<PayloadByType>({
    handlers: {
      add: makeHandlers(makeAddHandler),
      subtract: makeHandlers(makeSubtractHandler),
      updateAmount: makeHandlers(makeUpdateAmountHandler),
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
