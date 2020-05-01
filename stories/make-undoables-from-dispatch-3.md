Full code:

```typescript
import React, { FC, useReducer } from 'react';
import {
  useFlexibleUndo,
  makeUndoableReducer,
  PayloadFromTo,
  Updater,
  invertUndoable,
  UpdaterMaker,
  makeUndoableDepStateUpdater,
  makeUndoableFromToHandler,
} from '../.';
import { ActionList } from './components/action-list';
import { uiContainerClass, rootClass } from './styles';
import { NumberInput } from './components/number-input';

type Nullber = number | null;

interface State {
  count: number;
  amount: Nullber;
}

interface PayloadByType {
  add: undefined;
  subtract: undefined;
  updateAmount: PayloadFromTo<Nullber>;
}

type UM = UpdaterMaker<number>;
const addAmount: UM = amount => prev => prev + amount;
const subAmount: UM = amount => prev => prev - amount;

const countUpdater = (updaterMaker: UM): Updater<State> => state =>
  state.amount
    ? { ...state, count: updaterMaker(state.amount)(state.count) }
    : state;

const addUpdater = makeUndoableDepStateUpdater(countUpdater)(
  addAmount,
  subAmount
);

const { reducer, actionCreators } = makeUndoableReducer<State, PayloadByType>({
  add: addUpdater,
  subtract: invertUndoable(addUpdater),
  updateAmount: makeUndoableFromToHandler(amount => state => ({
    ...state,
    amount,
  })),
});

export const MakeUndoablesFromDispatch3: FC = () => {
  const [{ count, amount }, dispatch] = useReducer(reducer, {
    count: 0,
    amount: 1,
  });

  const {
    makeUndoablesFromDispatch,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useFlexibleUndo();

  const { add, subtract, updateAmount } = makeUndoablesFromDispatch(
    dispatch,
    actionCreators
  );

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
        <label>
          amount:&nbsp;
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
        <button disabled={!canUndo} onClick={() => undo()}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => redo()}>
          redo
        </button>
      </div>
      <ActionList stack={stack} timeTravel={timeTravel} />
    </div>
  );
};
```
