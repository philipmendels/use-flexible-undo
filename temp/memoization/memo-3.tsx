import React, { FC, useState, useMemo } from 'react';
import {
  PayloadFromTo,
  useFlexibleUndo,
  makeUndoableFTObjHandler,
  makeUndoableHandler,
  invertHandlers,
  combineUHandlerWithMeta,
  Callbacks,
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

interface MetaActionReturnTypes {
  describe: string;
}

export const Memoization3Example: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<Nullber>(1);

  const callbacks = useMemo<Callbacks<PayloadByType, MetaActionReturnTypes>>(
    () => ({
      onMakeUndoables: types => console.log('makeUndoables', types),
      onDoRedo: ({ eventName, meta }) =>
        console.log(`${eventName}: ${meta.describe()} when count was ${count}`),
    }),
    [count]
  );

  const {
    makeUndoables,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
    getMetaActionHandlers,
  } = useFlexibleUndo<PayloadByType, MetaActionReturnTypes>({
    callbacks,
  });

  const { add, subtract, updateAmount } = useMemo(() => {
    const undoableAddHandler = makeUndoableHandler(setCount)(
      amount => prev => prev + amount,
      amount => prev => prev - amount
    );
    return makeUndoables<PayloadByType>({
      add: combineUHandlerWithMeta(undoableAddHandler, {
        describe: amount => `Increase count by ${amount}`,
      }),
      subtract: combineUHandlerWithMeta(invertHandlers(undoableAddHandler), {
        describe: amount => `Decrease count by ${amount}`,
      }),
      updateAmount: combineUHandlerWithMeta(
        makeUndoableFTObjHandler(setAmount),
        {
          describe: ({ from, to }) => `Update amount from ${from} to ${to}`,
        }
      ),
    });
  }, [makeUndoables]);

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
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
        <button disabled={!amount} onClick={() => amount && add(amount)}>
          add
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
      <ActionList
        history={stack}
        timeTravel={timeTravel}
        convert={action => getMetaActionHandlers(action).describe()}
      />
    </div>
  );
};
