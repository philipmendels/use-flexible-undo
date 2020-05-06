import React, { FC, useReducer, useState } from 'react';
import {
  useFlexibleUndo,
  makeUndoableReducer,
  makeUndoableFTObjHandler,
  PayloadFromTo,
  Updater,
  invertHandlers,
  makeUndoableHandler,
} from '../../.';
import { ActionList } from '../components/action-list';
import { uiContainerClass, rootClass } from '../styles';
import { NumberInput } from '../components/number-input';

interface State {
  count: number;
}

interface PayloadByType {
  add: number;
  subtract: number;
}

type Nullber = number | null;

const makeCountHandler = (
  updater: Updater<number>
): Updater<State> => state => ({
  ...state,
  count: updater(state.count),
});

const undoableAddHandler = makeUndoableHandler(makeCountHandler)(
  amount => prev => prev + amount,
  amount => prev => prev - amount
);

const { reducer, actionCreators } = makeUndoableReducer<State, PayloadByType>({
  add: undoableAddHandler,
  subtract: invertHandlers(undoableAddHandler),
});

export const MakeUndoablesFromDispatchExample3: FC = () => {
  const [{ count }, dispatch] = useReducer(reducer, { count: 0 });
  const [amount, setAmount] = useState<Nullber>(1);

  const {
    makeUndoablesFromDispatch,
    makeUndoable,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useFlexibleUndo();

  const { add, subtract } = makeUndoablesFromDispatch(dispatch, actionCreators);

  const updateAmount = makeUndoable<PayloadFromTo<Nullber>>({
    type: 'updateAmount',
    ...makeUndoableFTObjHandler(setAmount),
  });

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
        <button disabled={!amount} onClick={() => amount && add(amount)}>
          add
        </button>
        <button disabled={!amount} onClick={() => amount && subtract(amount)}>
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
