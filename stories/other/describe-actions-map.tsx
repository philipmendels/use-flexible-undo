import React, { FC, useState, ReactNode } from 'react';
import {
  PayloadFromTo,
  useFlexibleUndo,
  makeUndoableFTHandler,
  makeUndoableHandler,
  invertHandlers,
  ActionUnion,
} from '../../.';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';
import { ActionList } from '../components/action-list';

type Nullber = number | null;

interface PayloadByType {
  add: number;
  subtract: number;
  updateAmount: PayloadFromTo<Nullber>;
}

type PayloadDescribers = {
  [K in keyof PayloadByType]: (payload: PayloadByType[K]) => ReactNode;
} & {
  start: () => ReactNode;
};

const payloadDescribers: PayloadDescribers = {
  add: amount => `Increase count by ${amount}`,
  subtract: amount => `Decrease count by ${amount}`,
  updateAmount: ({ from, to }) => `Update amount from ${from} to ${to}`,
  start: () => 'Start',
};

const describeAction = (action: ActionUnion<PayloadByType>) =>
  payloadDescribers[action.type](action.payload as any);

export const DescribeActionsMap: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<Nullber>(1);

  const undoableAddHandler = makeUndoableHandler(setCount)(
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
      updateAmount: makeUndoableFTHandler(setAmount),
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
        describeAction={describeAction}
      />
    </div>
  );
};
