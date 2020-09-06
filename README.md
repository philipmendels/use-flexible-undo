# use-flexible-undo

This library enables you to add a branching undo history to your React project. Because ... the very first thing every user will demand for any kind of app is a branching undo history!

<img src="https://github.com/philipmendels/use-flexible-undo/raw/master/assets/countfive.gif" width="426"/>

All jokes aside, you might be interested in experimenting with undo-redo UI 😎 and/or implementation 🤓. This lib gives you two React hooks to do so. They work with a history of undoable actions (as opposed to a history of snapshots of app state). Both hooks offer identical functionality and an almost identical API, but they differ in how they integrate with your app state:

- **useUndoableEffects** allows you to add undo/redo functionality independently of how you manage your app state. Updates to app state are modelled as a side-effect of updates to undo history state. You can use this hook together with (multiple calls to) useState, useReducer or a combination thereof. Quite nice for prototyping.
- **useUndoableReducer** manages your application state and undo history state together. This hook takes an undoable reducer which can be created with the included utility **makeUndoableReducer**.

Check out the <a href="https://philipmendels.github.io/use-flexible-undo" target="_blank">StoryBook</a> for a wide range of examples with documentation and source code.

## useUndoableEffects

```typescript
import React, { FC, useState } from 'react';
import { useUndoableEffects } from 'use-flexible-undo';

type nullber = number | null;

// action Payload By action Type
interface PBT {
  add: number;
  subtract: number;
  updateAmount: {
    from: nullber;
    to: nullber;
  };
}

export const MyFunctionComponent: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<nullber>(1);

  const {
    undoables,
    canUndo,
    undo,
    canRedo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects<PBT>({
    handlers: {
      add: {
        drdo: amount => setCount(prev => prev + amount),
        undo: amount => setCount(prev => prev - amount),
      },
      subtract: {
        drdo: amount => setCount(prev => prev - amount),
        undo: amount => setCount(prev => prev + amount),
      },
      updateAmount: {
        drdo: ({ to }) => setAmount(to),
        undo: ({ from }) => setAmount(from),
      },
    },
  });

  const { add, subtract, updateAmount } = undoables;

  return <> your UI here </>;
};
```

Mention no typing needed due to utils.
Mention split up in multiple (styled) components.

```typescript
import React, { FC, useState } from 'react';
import {
  useUndoableEffects,
  makeUndoableFTHandler,
  makeUndoableHandler,
  invertHandlers,
} from 'use-flexible-undo';
// following imports are not part of the library
import { addUpdater, subtractUpdater } from '../examples-util';
import {
  rootStyle,
  topUIStyle,
  countStyle,
  actionsStyle,
  getStackItemStyle,
} from '../styles';
import { NumberInput } from '../components/number-input';
import { getLastItem } from '../components/util';

export const MyFunctionComponent: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<number | null>(1);

  const undoableAddHandler = makeUndoableHandler(setCount)(
    addUpdater, // amount => prev => prev + amount
    subtractUpdater //        ... => prev - amount
  );

  const {
    undoables,
    canUndo,
    undo,
    canRedo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects({
    // types are inferred from setCount / setAmount
    handlers: {
      add: undoableAddHandler,
      subtract: invertHandlers(undoableAddHandler),
      updateAmount: makeUndoableFTHandler(setAmount),
    },
    options: {
      clearFutureOnDo: false,
      // This is the default.
      // Not clearing the future means making a new branch.
    },
  });

  const { add, subtract, updateAmount } = undoables;

  const { branches, currentBranchId, currentPosition } = history;
  const { stack } = branches[currentBranchId];

  // show the last-modified branch on top
  const branchList = Object.values(branches).sort(
    (a, b) =>
      getLastItem(b.stack).created.getTime() -
      getLastItem(a.stack).created.getTime()
  );

  return (
    <div className={rootStyle}>
      <div className={topUIStyle}>
        <div className={countStyle}>count &nbsp;= &nbsp;{count}</div>
        <div className={actionsStyle}>
          <label>
            amount =&nbsp;
            <NumberInput
              // simple util component that converts string
              // to number/null and vice versa
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
        <div className={actionsStyle}>
          <select
            value={currentBranchId}
            onChange={e => switchToBranch(e.target.value, 'HEAD_OF_BRANCH')}
          >
            {branchList.map(b => (
              <option key={b.id} value={b.id}>
                Branch {b.number}
              </option>
            ))}
          </select>
          <button disabled={!canUndo} onClick={undo}>
            undo
          </button>
          <button disabled={!canRedo} onClick={redo}>
            redo
          </button>
        </div>
      </div>
      // we reverse the list so that we have the newest action on top
      {stack
        .slice() // copy, because reverse is a mutable operation
        .reverse() // alternatively, you could try to reverse with css :)
        .map(({ id, type, payload }, index) => (
          <div
            key={id}
            // We need to recalculate the index due to the reversal.
            // Or you can use 'timeTravelById' if you do not care about
            // the lookup cost.
            onClick={() => timeTravel(stack.length - 1 - index)}
            className={getStackItemStyle({
              active: id === currentPosition.actionId,
            })}
          >
            {JSON.stringify({ type, payload })}
          </div>
        ))}
    </div>
  );
};
```

## useUndoableReducer

explain why, explain disadvantage of getting stuff from the prev state

```typescript
import React, { FC } from 'react';
import {
  makeUnducer,
  invertHandlers,
  makeUndoableFTHandler,
  makeUndoableUpdater,
  makeUndoableReducer,
  useUndoableReducer,
} from 'use-flexible-undo';
import { addUpdater, subtractUpdater, merge } from '../examples-util';

type nullber = number | null;

interface State {
  count: number;
  amount: nullber;
}

interface PayloadByType {
  add: void; // a void payload also means that the user will not see in
  subtract: void; // the undo history UI how much was added/subtracted :(
  updateAmount: {
    from: nullber;
    to: nullber;
  };
}

// get 'amount' from the previous state instead of from the payload
const selectDependency = (payload: void) => (state: State) => state.amount || 0;

const countUpdater = makeUpdater(
  (state: State) => state.count,
  count => merge({ count })
)(selectDependency);

const { reducer, actionCreators } = makeReducer<State, PayloadByType>({
  add: countUpdater(addUpdater),
  subtract: countUpdater(subtractUpdater),
  updateAmount: makeFTHandler(amount => merge({ amount })),
});

// create a higher-order reducer with separate action creators for 'undo'
const undoableReducer = makeUndoableReducer(reducer, {
  add: actionCreators.subtract,
  subtract: actionCreators.add,
  updateAmount: invertFTHandler(actionCreators.updateAmount),
});

export const MyFunctionComponent: FC = () => {
  const { state, undoables, ...etc } = useUndoableReducer({
    undoableReducer,
    actionCreators,
    initialState: {
      count: 0,
      amount: 1,
    },
  });

  const { count, amount } = state;

  const { add, subtract, updateAmount } = undoables;

  return <> your UI here </>;
};
```

more experimental, mention disadvantage

```typescript
const selectDependency = (payload: void) => (state: State) => state.amount || 0;

const undoableAddUpdater = makeUndoableUpdater(
  (state: State) => state.count,
  count => merge({ count })
)(selectDependency)(addUpdater, subtractUpdater);

// 'undo' case is handled by the reducer internally
const { unducer, actionCreators } = makeUnducer<State, PayloadByType>({
  add: undoableAddUpdater,
  subtract: invertHandlers(undoableAddUpdater),
  updateAmount: makeUndoableFTHandler(amount => merge({ amount })),
});

// no need to pass action-creators for 'undo'
const undoableReducer = makeUndoableReducer(unducer);
```
