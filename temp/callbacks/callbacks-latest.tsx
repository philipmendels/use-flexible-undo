import React, { FC, useState } from 'react';
import {
  PayloadFromTo,
  useFlexibleUndo,
  makeUndoableFTObjHandler,
  makeUndoableHandler,
  invertHandlers,
} from '../../dist';
import { rootClass, uiContainerClass } from '../../stories/styles';
import { ActionList } from '../../stories/components/action-list';
import { NumberInput } from '../../stories/components/number-input';

type Nullber = number | null;

interface PayloadByType {
  add: number;
  subtract: number;
  updateAmount: PayloadFromTo<Nullber>;
}

export const CallbacksLatestExample: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<Nullber>(1);

  const {
    makeUndoables,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useFlexibleUndo({
    callbacks: {
      onDoRedo: ({ action }) =>
        console.log(
          `clicked ${action.type}:${JSON.stringify(
            action.payload
          )} when count was ${count} and amount was ${amount}`
        ),
      latest: {
        onDoRedo: ({ action }) =>
          console.log(
            `executed ${action.type}:${JSON.stringify(
              action.payload
            )} when count was ${count} and amount was ${amount}`
          ),
      },
    },
  });

  const undoableAddHandler = makeUndoableHandler(setCount)(
    amount => prev => prev + amount,
    amount => prev => prev - amount
  );

  const { add, subtract, updateAmount } = makeUndoables<PayloadByType>({
    add: undoableAddHandler,
    subtract: invertHandlers(undoableAddHandler),
    updateAmount: makeUndoableFTObjHandler(setAmount),
  });

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
        <label>
          amount:&nbsp;
          <NumberInput
            value={amount}
            onChange={value =>
              setTimeout(
                () =>
                  updateAmount({
                    from: amount,
                    to: value,
                  }),
                500
              )
            }
          />
        </label>
        <button
          disabled={!amount}
          onClick={() => setTimeout(() => amount && add(amount), 3000)}
        >
          add (3s delay)
        </button>
        <button disabled={!amount} onClick={() => amount && subtract(amount)}>
          subtract
        </button>
        <button disabled={!canUndo} onClick={() => undo()}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => redo()}>
          redo
        </button>
      </div>
      {/* <ActionList history={stack} timeTravel={timeTravel} /> */}
    </div>
  );
};
