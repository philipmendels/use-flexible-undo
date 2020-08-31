import React, { FC, useState } from 'react';
import {
  useUndoableEffects,
  makeUndoableFTHandler,
  invertHandlers,
  makeUndoableSetter,
} from 'use-flexible-undo';
import { merge, addUpdater, subtractUpdater } from '../examples-util';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { ActionList } from '../components/action-list';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';

type Nullber = number | null;

interface State {
  count: number;
  amount: Nullber;
}

export const PreviousStateAndPayloadExample: FC = () => {
  const [{ count, amount }, setState] = useState<State>({
    count: 0,
    amount: 1,
  });

  const selectAmount = (shouldDouble: boolean) => ({ amount }: State) =>
    amount ? (shouldDouble ? amount * 2 : amount) : 0;

  const undoableAddHandler = makeUndoableSetter(setState)(
    state => state.count,
    count => merge({ count })
  )(selectAmount)(addUpdater, subtractUpdater);

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects({
    handlers: {
      add: undoableAddHandler,
      subtract: invertHandlers(undoableAddHandler),
      updateAmount: makeUndoableFTHandler((amount: Nullber) =>
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
