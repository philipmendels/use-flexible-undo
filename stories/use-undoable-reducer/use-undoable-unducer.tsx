import React, { FC } from 'react';
import {
  makeUnducer,
  PayloadFromTo,
  invertHandlers,
  makeUndoableFTHandler,
  makeUndoableUpdater,
  makeUndoableReducer,
  useUndoableReducer,
} from 'use-flexible-undo';
import { merge, addUpdater, subtractUpdater } from '../examples-util';
import { topUIStyle, rootStyle, countStyle, actionsStyle } from '../styles';
import { NumberInput } from '../components/number-input';
import { ActionList } from '../components/action-list';
import { BranchNav } from '../components/branch-nav';

type Nullber = number | null;

interface State {
  count: number;
  amount: Nullber;
}

interface PayloadByType {
  add: number;
  subtract: number;
  updateAmount: PayloadFromTo<Nullber>;
}

// Here we get "amount" from the payload. Alternatively you can get it
// from the previous state, but then you will not have access to the
// value when constructing the UI for the undo history.
const selectDependency = (amount: number) => () => amount;

const undoableAddUpdater = makeUndoableUpdater(
  (state: State) => state.count,
  count => merge({ count })
)(selectDependency)(addUpdater, subtractUpdater);

const { unducer, actionCreators } = makeUnducer<State, PayloadByType>({
  add: undoableAddUpdater,
  subtract: invertHandlers(undoableAddUpdater),
  updateAmount: makeUndoableFTHandler(amount => merge({ amount })),
});

const undoableReducer = makeUndoableReducer(unducer);

export const UseUndoableUnducerExample: FC = () => {
  const {
    state,
    history,
    undoables,
    undo,
    redo,
    timeTravel,
    switchToBranch,
  } = useUndoableReducer({
    undoableReducer,
    initialState: {
      count: 0,
      amount: 1,
    },
    actionCreators,
  });

  const { count, amount } = state;

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
          <button disabled={!amount} onClick={() => amount && add(amount)}>
            add
          </button>
          <button disabled={!amount} onClick={() => amount && subtract(amount)}>
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
