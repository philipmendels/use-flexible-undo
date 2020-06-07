Full code:

```typescript
import React, { FC, useReducer } from 'react';
import {
  useFlexibleUndo,
  makeUndoableReducer,
  PayloadFromTo,
  Updater,
  UpdaterMaker,
  makeUndoableFTObjHandler,
  combineHandlers,
  merge,
} from 'use-flexible-undo';
import { ActionList } from '../components/action-list';
import { uiContainerClass, rootClass } from '../styles';
import { NumberInput } from '../components/number-input';

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

const makeCountHandler = (um: UpdaterMaker<number>) => (): Updater<
  State
> => prev =>
  prev.amount ? { ...prev, count: um(prev.amount)(prev.count) } : prev;

const addHandler = makeCountHandler(amount => prev => prev + amount);
const subHandler = makeCountHandler(amount => prev => prev - amount);

const { reducer, actionCreators } = makeUndoableReducer<State, PayloadByType>({
  add: combineHandlers(addHandler, subHandler),
  subtract: combineHandlers(subHandler, addHandler),
  updateAmount: makeUndoableFTObjHandler(amount => merge({ amount })),
});

export const MakeUndoablesFromDispatchExample: FC = () => {
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
