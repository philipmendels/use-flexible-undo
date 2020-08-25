### Reducer & makeUndoableUpdater - Readme & Code

You can extract your state update logic from your components by using a reducer. If you use a reducer / Redux, you may want to consider using one of the many undo libraries that integrate with that instead of using a state management independent solution like we have here. Nevertheless, let's explore how we can integrate this library with a reducer.

The utility **makeUndoableUpdater** is similar to **makeUndoableSetter** which was explained in the previous chapter. The difference is that it does not take the initial state setter function, and consequently it does not set the state, but returns do/redo & undo state updater functions that you can use in a reducer. Again this may not be a one-size-fits-all solution. Feel free to write your own solution, for example using lenses and other functional utilities.

In this example you can see that manually writing a reducer and calling dispatch from the handlers involves writing a lot of repetitive code. We could optimize the code a bit by leaving out the "subtract" case from the reducer, and simply using the inverse of the "add" handler for the "subtract" handler (e.g. using the **invertHandlers** util). But this would only bring us so far. In the next examples we look at some utilities for removing more repetitive code.

```typescript
import React, { FC, useReducer } from 'react';
import {
  useUndoableEffects,
  PayloadFromTo,
  Unducer,
  makeUndoableUpdater,
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

const undoableAddHandler = makeUndoableUpdater(
  (state: State) => state.count,
  count => merge({ count })
)((_: void) => state => state.amount || 0)(addUpdater, subtractUpdater);

const reducer: Unducer<State, PayloadByType> = (prevState, action) => {
  const isUndo = action.meta?.isUndo;
  switch (action.type) {
    case 'add':
      return isUndo
        ? undoableAddHandler.undo()(prevState)
        : undoableAddHandler.drdo()(prevState);
    case 'subtract':
      return isUndo
        ? undoableAddHandler.drdo()(prevState)
        : undoableAddHandler.undo()(prevState);
    case 'updateAmount':
      const { from, to } = action.payload;
      return { ...prevState, amount: isUndo ? from : to };
    default:
      return prevState;
  }
};

export const ReducerAndMakeUndoableUpdaterExample: FC = () => {
  const [{ count, amount }, dispatch] = useReducer(reducer, {
    count: 0,
    amount: 1,
  });

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects<PayloadByType>({
    handlers: {
      add: {
        drdo: () => dispatch({ type: 'add', meta: { isUndo: false } }),
        undo: () => dispatch({ type: 'add', meta: { isUndo: true } }),
      },
      subtract: {
        drdo: () => dispatch({ type: 'subtract', meta: { isUndo: false } }),
        undo: () => dispatch({ type: 'subtract', meta: { isUndo: true } }),
      },
      updateAmount: {
        drdo: payload =>
          dispatch({ type: 'updateAmount', payload, meta: { isUndo: false } }),
        undo: payload =>
          dispatch({ type: 'updateAmount', payload, meta: { isUndo: true } }),
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
