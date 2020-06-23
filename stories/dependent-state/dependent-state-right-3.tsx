import React, { FC, useState } from 'react';
import {
  PayloadFromTo,
  useFlexibleUndo,
  makeUndoableFTObjHandler,
  UpdaterMaker,
  makeUndoableStateDepHandler,
  invertHandlers,
  merge,
} from '../../.';
import { root, ui } from '../styles';
import { ActionList } from '../components/action-list';
import { NumberInput } from '../components/number-input';

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

export const DependentStateRight3Example: FC = () => {
  const [{ count, amount }, setState] = useState<State>({
    count: 0,
    amount: 1,
  });

  const makeCountHandler = (um: UpdaterMaker<number>) => () =>
    setState(prev =>
      prev.amount ? { ...prev, count: um(prev.amount)(prev.count) } : prev
    );

  const undoableAddHandler = makeUndoableStateDepHandler(makeCountHandler)(
    amount => prev => prev + amount,
    amount => prev => prev - amount
  );

  const {
    undoables,
    canUndo,
    undo,
    canRedo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useFlexibleUndo<PayloadByType>({
    handlers: {
      add: undoableAddHandler,
      subtract: invertHandlers(undoableAddHandler),
      updateAmount: makeUndoableFTObjHandler(amount =>
        setState(merge({ amount }))
      ),
    },
  });

  const { add, subtract, updateAmount } = undoables;

  return (
    <div className={root}>
      <div>count = {count}</div>
      <div className={ui}>
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
      <ActionList
        history={history}
        timeTravel={timeTravel}
        switchToBranch={switchToBranch}
      />
    </div>
  );
};
