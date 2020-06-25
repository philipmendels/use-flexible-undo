import React, { FC, useState } from 'react';
import {
  useFlexibleUndo,
  makeUndoableReducer,
  makeUndoableFTObjHandler,
  PayloadFromTo,
  Updater,
  invertHandlers,
  makeUndoableHandler,
  useUndoableReducer,
} from '../../.';
import { topUIStyle, rootStyle, countStyle, actionsStyle } from '../styles';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';
import { ActionList } from '../components/action-list';

interface State {
  count: number;
}

interface PayloadByType_Reducer {
  add: number;
  subtract: number;
}

type Nullber = number | null;

interface PayloadByType extends PayloadByType_Reducer {
  updateAmount: PayloadFromTo<Nullber>;
}

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

const { reducer, actionCreators } = makeUndoableReducer<
  State,
  PayloadByType_Reducer
>({
  add: undoableAddHandler,
  subtract: invertHandlers(undoableAddHandler),
});

export const MakeUndoablesFromDispatchExample3: FC = () => {
  const [{ count }, handlers] = useUndoableReducer(
    reducer,
    { count: 0 },
    actionCreators
  );
  const [amount, setAmount] = useState<Nullber>(1);

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useFlexibleUndo<PayloadByType>({
    handlers: {
      ...handlers,
      updateAmount: makeUndoableFTObjHandler(setAmount),
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
