import React, { FC, useReducer } from 'react';
import {
  useFlexibleUndo,
  PayloadFromTo,
  UReducer,
  UpdaterMaker,
  Updater,
} from '../../.';
import { ActionList } from '../components/action-list';
import { root, ui } from '../styles';
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

const makeCountUpdater = (um: UpdaterMaker<number>): Updater<State> => prev =>
  prev.amount ? { ...prev, count: um(prev.amount)(prev.count) } : prev;

const addUpdater = makeCountUpdater(amount => prev => prev + amount);
const subUpdater = makeCountUpdater(amount => prev => prev - amount);

const reducer: UReducer<State, PayloadByType> = (prevState, action) => {
  const isUndo = action.meta?.isUndo;
  switch (action.type) {
    case 'add':
      return isUndo ? subUpdater(prevState) : addUpdater(prevState);
    case 'subtract':
      return isUndo ? addUpdater(prevState) : subUpdater(prevState);
    case 'updateAmount':
      const { from, to } = action.payload;
      return { ...prevState, amount: isUndo ? from : to };
    default:
      return prevState;
  }
};

export const UsingReducer: FC = () => {
  const [{ count, amount }, dispatch] = useReducer(reducer, {
    count: 0,
    amount: 1,
  });

  const {
    undoables,
    canUndo,
    undo,
    canRedo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useFlexibleUndo<PayloadByType>({
    handlers: {
      add: {
        drdo: () => dispatch({ type: 'add' }),
        undo: () => dispatch({ type: 'add', meta: { isUndo: true } }),
      },
      subtract: {
        drdo: () => dispatch({ type: 'subtract' }),
        undo: () => dispatch({ type: 'subtract', meta: { isUndo: true } }),
      },
      updateAmount: {
        drdo: payload => dispatch({ type: 'updateAmount', payload }),
        undo: payload =>
          dispatch({ type: 'updateAmount', payload, meta: { isUndo: true } }),
      },
    },
  });

  const { add, subtract, updateAmount } = undoables;

  return (
    <div className={root}>
      <div>count = {count}</div>
      <div className={ui}>
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
      <ActionList
        history={history}
        timeTravel={timeTravel}
        switchToBranch={switchToBranch}
      />
    </div>
  );
};
