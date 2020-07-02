import React, { FC, useReducer } from 'react';
import {
  useFlexibleUndo,
  PayloadFromTo,
  UReducer,
  makeUndoablePartialStateUpdater,
} from '../../.';
import { merge } from '../examples-util';
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

const undoableAddHandler = makeUndoablePartialStateUpdater(
  (_: void) => state => state.amount || 0,
  (state: State) => state.count,
  count => merge({ count })
)(
  amount => prev => prev + amount,
  amount => prev => prev - amount
);

const reducer: UReducer<State, PayloadByType> = (prevState, action) => {
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

export const UsingReducer: FC = () => {
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
