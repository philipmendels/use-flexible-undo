import React, { FC, useState } from 'react';
import {
  useUndoableEffects,
  makeUndoableFTHandler,
  makeUndoableHandler,
  invertHandlers,
  History,
} from 'use-flexible-undo';
import { addUpdater, subtractUpdater } from '../examples-util';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { ActionList } from '../components/action-list';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';

type nullber = number | null;

// action Payload By action Type
interface PBT {
  add: number;
  subtract: number;
  updateAmount: {
    from: nullber;
    to: nullber;
  };
}

const initialHistory: History<PBT> = {
  currentBranchId: '06913f31-a94c-4c26-951c-41076f5318eb',
  currentPosition: {
    actionId: 'c3c2a14b-afe6-4d90-9dc6-6cf46e017ba3',
    globalIndex: 0,
  },
  branches: {
    '06913f31-a94c-4c26-951c-41076f5318eb': {
      id: '06913f31-a94c-4c26-951c-41076f5318eb',
      number: 1,
      created: new Date('2020-09-05T00:02:09.484Z'),
      stack: [
        {
          type: 'start',
          created: new Date('2020-09-05T00:02:09.484Z'),
          id: 'c3c2a14b-afe6-4d90-9dc6-6cf46e017ba3',
        },
        {
          type: 'add',
          payload: 1,
          created: new Date('2020-09-05T00:02:14.500Z'),
          id: '69f6dcce-4f3f-4db6-a52b-dc35f5ebc51d',
        },
        {
          type: 'updateAmount',
          payload: { from: 1, to: 2 },
          created: new Date('2020-09-05T00:02:15.375Z'),
          id: '4e9ec882-c72b-4615-b9ce-d8c368e4af40',
        },
        {
          type: 'add',
          payload: 2,
          created: new Date('2020-09-05T00:02:15.895Z'),
          id: '100eb7c5-9522-4319-b0cb-d27e18043974',
        },
        {
          type: 'updateAmount',
          payload: { from: 2, to: 3 },
          created: new Date('2020-09-05T00:02:16.554Z'),
          id: '504b5aed-5909-48b1-bd69-874844c478c2',
        },
        {
          type: 'add',
          payload: 3,
          created: new Date('2020-09-05T00:02:17.335Z'),
          id: 'c49926b7-0174-4cbd-a3a1-353704e93160',
        },
      ],
    },
  },
};

export const InitialHistoryTypedExample: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<number | null>(1);

  const undoableAddHandler = makeUndoableHandler(setCount)(
    addUpdater,
    subtractUpdater
  );

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
      updateAmount: makeUndoableFTHandler(setAmount),
    },
    initialHistory,
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
