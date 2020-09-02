# useFlexibleUndo

This library enables you to add a branching undo history to your React project. Because ... the very first thing every user will demand for any kind of app is a branching undo history!

<img src="https://github.com/philipmendels/use-flexible-undo/raw/master/assets/countfive.gif" width="426"/>

All jokes aside, you might be interested in experimenting with undo-redo UI 😎 and/or implementation 🤓. This lib gives you two React hooks to do so. They work with a history of undoable actions (as opposed to a history of snapshots of app state). Both hooks offer identical functionality and an almost identical API, but they differ in how they integrate with your app state:

- **useUndoableEffects** allows you to add undo/redo functionality independently of how you manage your app state. Updates to app state are modelled as a side-effect of updates to undo history state. You can use this hook together with (multiple calls to) useState, useReducer or a combination thereof. Quite nice for prototyping.
- **useUndoableReducer** manages your application state and undo history state together. This hook takes an undoable reducer which can be created with the included utility **makeUndoableReducer**.

Check out the StoryBook for a wide range of examples with documentation and source code.

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

```typescript
import React, { FC, useState } from 'react';
import {
  useUndoableEffects,
  makeUndoableFTHandler,
  makeUndoableHandler,
  invertHandlers,
} from 'use-flexible-undo';
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
    addUpdater,
    subtractUpdater
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
    handlers: {
      add: undoableAddHandler,
      subtract: invertHandlers(undoableAddHandler),
      updateAmount: makeUndoableFTHandler(setAmount),
    },
    options: {
      clearFutureOnDo: false, // this is the default
    },
  });

  const { add, subtract, updateAmount } = undoables;

  const { branches, currentBranchId, currentPosition } = history;
  const { stack } = branches[currentBranchId];

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
              <option value={b.id}>Branch {b.number}</option>
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

      {stack
        .slice() // copy, because reverse is a mutable operation
        .reverse() // alternatively, you could try to reverse with css :)
        .map(({ id, type, payload }, index) => (
          <div
            key={id}
            // We need to recalculate the index due to the reversal.
            // Alternatively use timeTravelById if you do not care about
            // the lookup cost
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
import { merge } from '../examples-util';

type nullber = number | null;

interface State {
  count: number;
  amount: nullber;
}

interface PayloadByType {
  add: void;
  subtract: void;
  updateAmount: {
    from: nullber;
    to: nullber;
  };
}

const undoableAddHandler = makeUndoableUpdater(
  (state: State) => state.count,
  count => merge({ count })
)(() => state => state.amount || 0)(
  amount => prev => prev + amount,
  amount => prev => prev - amount
);

const { reducer, actionCreators } = makeUnducer<State, PayloadByType>({
  add: undoableAddHandler,
  subtract: invertHandlers(undoableAddHandler),
  updateAmount: makeUndoableFTHandler(amount => merge({ amount })),
});

const undoableReducer = makeUndoableReducer(reducer);

export const MyFunctionComponent: FC = () => {
  const { state, undoables, ...etc } = useUndoableReducer({
    reducer: undoableReducer,
    initialState: {
      count: 0,
      amount: 1,
    },
    actionCreators,
  });

  const { count, amount } = state;

  const { add, subtract, updateAmount } = undoables;

  return <> your UI here </>;
};
```
