import React, { FC, useReducer, useState } from 'react';
import {
  useFlexibleUndo,
  makeUndoableReducer,
  makeUndoableFromToHandler,
  PayloadFromTo,
  makeUndoableStateUpdater,
} from '../.';
import { ActionList } from './components/action-list';
import { uiContainerClass, rootClass } from './styles';
import { NumberInput } from './components/number-input';

interface State {
  count: number;
}

interface PayloadByType {
  add: number;
  subtract: number;
}

type Nullber = number | null;

const makeCountHandler = (sign: 1 | -1) => (amount: number) => (
  state: State
) => ({ ...state, count: state.count + sign * amount });

const addHandler = makeCountHandler(1);
const subHandler = makeCountHandler(-1);

const { reducer, actionCreators } = makeUndoableReducer<State, PayloadByType>({
  add: makeUndoableStateUpdater(addHandler, subHandler),
  subtract: makeUndoableStateUpdater(subHandler, addHandler),
});

export const MakeUndoablesFromDispatch3: FC = () => {
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
    ...makeUndoableFromToHandler(setAmount),
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
