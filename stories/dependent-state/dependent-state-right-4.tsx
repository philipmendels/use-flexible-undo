import React, { FC, useState } from 'react';
import {
  PayloadFromTo,
  useFlexibleUndo,
  makeUndoableFTHandler,
  UpdaterMaker,
  makeUndoableStateDepHandler,
  invertHandlers,
} from '../../.';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { ActionList } from '../components/action-list';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';
import { merge } from '../examples-util';

type Nullber = number | null;

interface State {
  count: number;
  amount: Nullber;
}

interface PayloadByType {
  add: boolean;
  subtract: boolean;
  updateAmount: PayloadFromTo<Nullber>;
}

export const DependentStateRight4Example: FC = () => {
  const [{ count, amount }, setState] = useState<State>({
    count: 0,
    amount: 1,
  });

  const makeCountHandler = (um: UpdaterMaker<number>) => (
    shouldDouble: boolean
  ) =>
    setState(prev =>
      prev.amount
        ? {
            ...prev,
            count: um(shouldDouble ? prev.amount * 2 : prev.amount)(prev.count),
          }
        : prev
    );

  const undoableAddHandler = makeUndoableStateDepHandler(makeCountHandler)(
    amount => prev => prev + amount,
    amount => prev => prev - amount
  );

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useFlexibleUndo<PayloadByType>({
    handlers: {
      add: undoableAddHandler,
      subtract: invertHandlers(undoableAddHandler),
      updateAmount: makeUndoableFTHandler(amount =>
        setState(merge({ amount }))
      ),
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
          <button disabled={!amount} onClick={() => add(false)}>
            add
          </button>
          <button disabled={!amount} onClick={() => add(true)}>
            add x 2
          </button>
          <button disabled={!amount} onClick={() => subtract(false)}>
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
