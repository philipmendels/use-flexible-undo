import React, { FC } from 'react';
import {
  useFlexibleUndo,
  makeUndoableReducer,
  PayloadFromTo,
  useUndoableReducer,
  makeUndoableFromToHandler,
  UpdaterMaker,
  Updater,
  combineHandlers,
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

const countUpdater = (updater: UM) => (): Updater<State> => state =>
  state.amount
    ? { ...state, count: updater(state.amount)(state.count) }
    : state;

const addHandler = countUpdater(addAmount);
const subHandler = countUpdater(subAmount);

const { reducer, actionCreators } = makeUndoableReducer<State, PayloadByType>({
  add: combineHandlers(addHandler, subHandler),
  subtract: combineHandlers(subHandler, addHandler),
  updateAmount: makeUndoableFromToHandler(amount => state => ({
    ...state,
    amount,
  })),
});

export const UseUndoableReducer: FC = () => {
  const {
    state: { count, amount },
    boundActionCreators,
  } = useUndoableReducer(
    reducer,
    {
      count: 0,
      amount: 1,
    },
    actionCreators
  );

  const {
    makeUndoables,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useFlexibleUndo();

  const { add, subtract, updateAmount } = makeUndoables<PayloadByType>(
    boundActionCreators
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
