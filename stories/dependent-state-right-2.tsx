import React, { FC, useState } from 'react';
import {
  PayloadFromTo,
  useFlexibleUndo,
  makeUndoableFTObjHandler,
  combineHandlers,
  UpdaterMaker,
  merge,
} from '../.';
import { rootClass, uiContainerClass } from './styles';
import { ActionList } from './components/action-list';
import { NumberInput } from './components/number-input';

type Nullber = number | null;

interface State {
  count: number;
  amount: Nullber;
}

interface PayloadByType {
  add: undefined;
  subtract: undefined;
  updateAmount: PayloadFromTo<Nullber>;
}

export const DependentStateRight2Example: FC = () => {
  const [{ count, amount }, setState] = useState<State>({
    count: 0,
    amount: 1,
  });

  const {
    makeUndoables,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useFlexibleUndo();

  const makeCountHandler = (um: UpdaterMaker<number>) => () =>
    setState(prev =>
      prev.amount ? { ...prev, count: um(prev.amount)(prev.count) } : prev
    );

  const addHandler = makeCountHandler(amount => prev => prev + amount);
  const subHandler = makeCountHandler(amount => prev => prev - amount);

  const { add, subtract, updateAmount } = makeUndoables<PayloadByType>({
    add: combineHandlers(addHandler, subHandler),
    subtract: combineHandlers(subHandler, addHandler),
    updateAmount: makeUndoableFTObjHandler(amount =>
      setState(merge({ amount }))
    ),
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
        <button disabled={!canUndo} onClick={() => undo()}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => redo()}>
          redo
        </button>
      </div>
      <ActionList stack={stack} timeTravel={timeTravel} />
    </div>
  );
};
