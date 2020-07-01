import React, { FC } from 'react';
import {
  useFlexibleUndo,
  makeUndoableReducer,
  PayloadFromTo,
  useUndoableReducer,
  makeUndoableFTHandler,
  invertHandlers,
  makeUndoablePartialStateUpdater,
} from '../../.';
import { merge } from '../examples-util';
import { topUIStyle, rootStyle, countStyle, actionsStyle } from '../styles';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';
import { ActionList } from '../components/action-list';

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
  () => state => state.amount || 0,
  (state: State) => state.count,
  count => merge({ count })
)(
  amount => prev => prev + amount,
  amount => prev => prev - amount
);

const { reducer, actionCreators } = makeUndoableReducer<State, PayloadByType>({
  add: undoableAddHandler,
  subtract: invertHandlers(undoableAddHandler),
  updateAmount: makeUndoableFTHandler(amount => merge({ amount })),
});

export const UseUndoableReducer: FC = () => {
  const [{ count, amount }, handlers] = useUndoableReducer(
    reducer,
    {
      count: 0,
      amount: 1,
    },
    actionCreators
  );

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useFlexibleUndo({
    handlers,
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
