# use-flexible-undo

This lib gives you hooks and utilities for adding a _branching_ undo history to your React project, or in general for experimenting with undo-redo UI 😎 and/or implementation 🤓 in React.
<br/><br/>
<img src="https://github.com/philipmendels/use-flexible-undo/raw/master/assets/countfive.gif" width="426"/>
<br/><br/>
The library includes two main hooks that offer identical functionality and an almost identical API, but differ in how they integrate with your application state:

- **useUndoableEffects** allows you to add undo/redo functionality independently of how you manage your app state. Updates to app state are modelled as a side-effect of updates to undo history state. You can use this hook together with (multiple calls to) useState, useReducer or a combination thereof. Quite nice for prototyping.
- **useUndoableReducer** integrates your application state and the undo history state. This hook takes an undoable reducer which can be created with the included utility **makeUndoableReducer**.

Both hooks work with a history of undoable actions as opposed to a history of snapshots of global application state. This approach makes it possible to experiment with undo/redo without putting specific constraints on state management. Constraints _are_ often a good thing (e.g. using Redux with Redux-Undo works great 🙂), but this lib simply provides an alternative more explorative perspective.

This library does not contain UI-components.

## Installation and usage

```
npm i use-flexible-undo
```

```typescript
import { useUndoableEffects } from 'use-flexible-undo';
```

```typescript
import { makeUndoableReducer, useUndoableReducer } from 'use-flexible-undo';
```

This lib is written in TypeScript so types for TS are included.

## Examples

Check out the <a href="https://philipmendels.github.io/use-flexible-undo" target="_blank">StoryBook</a> for interactive examples with documentation and source code. Check out the examples below for a quick overview.

### useUndoableEffects

The useUndoableEffects hook takes a **handlers** object with pairs of do/redo ("drdo") and undo handlers by action type, and returns an **undoables** object with undoable functions by action type.

If you use TypeScript then you can type the hook with a record of payload by action type ("PBT"). Alternatively you could type the payloads within the handlers and let PBT be inferred.

You are free to model the payloads however you like. Depending on your needs you can use them to store the state delta (see "add" and "subtract") or for example the old and the new state (see "updateAmount").

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

The library provides you with various utilities for generating your do/redo & undo handlers from your state setter functions. Using these utils has the added benefit that the payload types can be inferred. If you want you can of course still type the hook with a record of payload by action type, for some extra control.

Apart from these utilities, the following example illustrates the usage of most of the return values of the hook: The **canUndo** and **canRedo** booleans, the **history** state, and the **undo**, **redo**, **timeTravel** and **switchToBranch** functions. The example includes some basic inline UI, but in your project you probably want to split this up into multiple (styled) components.

```typescript
import React, { FC, useState } from 'react';
import {
  useUndoableEffects,
  makeUndoableFTHandler,
  makeUndoableHandler,
  invertHandlers,
} from 'use-flexible-undo';
// following imports are not part of the library
import {
  addUpdater,
  subtractUpdater,
  assertNever,
  getLastItem,
} from '../examples-util';
import { getStackItemStyle } from '../styles';
import { NumberInput } from '../components/number-input';

export const MyFunctionComponent: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<number | null>(1);

  const undoableAddHandler = makeUndoableHandler(setCount)(
    addUpdater, //     amount => prev => prev + amount
    subtractUpdater // amount => prev => prev - amount
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
    // payload types are inferred from setCount / setAmount
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
    <>
      <div>count = {count}</div>
      <label>
        amount =
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
      // we reverse the list so that we have the newest action on top
      {stack
        .slice() // copy, because reverse is a mutable operation. You could also
        .reverse() // try to reverse with css or write your own mapReverse function.
        .map((action, index) => (
          <div
            key={action.id}
            // We need to recalculate the index due to the reversal.
            // Or you can use 'timeTravelById' if you do not care about
            // the lookup cost.
            onClick={() => timeTravel(stack.length - 1 - index)}
            className={getStackItemStyle({
              active: action.id === currentPosition.actionId,
            })}
          >
            {// Types for actions (type, payload) are fully inferred,
            //  but in practice you probably want to extract this code.
            action.created.toLocaleString() +
              ' - ' +
              (action.type === 'add'
                ? `Add ${action.payload} to count`
                : action.type === 'subtract'
                ? `Subtract ${action.payload} from count`
                : action.type === 'updateAmount'
                ? `Update amount from ${action.payload.from} to ${action.payload.to}`
                : action.type === 'start'
                ? 'Start'
                : assertNever(action))}
          </div>
        ))}
    </>
  );
};
```

When using **useUndoableEffects** you have to make sure that you get your state dependencies (in this case "amount") in your do/redo & undo handlers from either the **action payload** or the **previous state**, and not directly from the component state. Otherwise you may break time-travel. See this [example](https://philipmendels.github.io/use-flexible-undo/?path=/story/useundoableeffects-dependent-state--don-t-do-this) to see this in action.

### useUndoableReducer

If you want to keep your undo-history state and you application state integrated, and/or if you want to extract your state update logic from your component(s) for various reasons (e.g. performance, testing, seperation of concerns), then you can create a reducer from scratch or with the included utils. You can pass this reducer together with an object map of undo action creators by action type to **makeUndoableReducer**. The resulting undoable reducer can be used directly with React's useReducer, or you can provide it to **useUndoableReducer**. This is a simple wrapper for useReducer, and it gives you a similar API as **useUndoableEffects**.

The following example also shows that you are free to get your state dependencies from the previous state instead of from the action payload. This however does have a possible downside: You will not have direct access to the previous state for each action in the undo history UI, so the user will only see the action types.

```typescript
import React, { FC } from 'react';
import {
  makeUpdater,
  makeFTHandler,
  invertFTHandler,
  makeReducer,
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

A bit more experimental: You can also make a reducer that handles the undo cases internally, based on the `{ meta: { isUndo: boolean }}` part of the actions. This means that you do not need to provide the undo action creators to **makeUndoableReducer**, but it has the possible downside that it is harder to see the difference between undo and redo in something like Redux-devtools.

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

## Roadmap

- not-so-distant future: add tests
- distant future: non-linear / selective undo 🤓
