### makeReducer & bindActionCreators - Readme & code

The utility **makeReducer** takes an object with state updater functions by action type. It returns an object with a reducer and with action creators by action type. The reducer can be passed to useReducer.

The utility **bindActionCreators** takes the dispatch function (returned by useReducer) and an object with action creators by action type, and returns an object with do/redo handlers by action type. This object can be passed to the "drdoHandlers" prop of **useUndoableEffects**.

```typescript
import React, { FC, useReducer } from 'react';
import {
  useUndoableEffects,
  PayloadFromTo,
  makeUpdater,
  makeFTHandler,
  invertFTHandler,
  makeReducer,
  bindActionCreators,
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

interface PayloadByType {
  add: void;
  subtract: void;
  updateAmount: PayloadFromTo<Nullber>;
}

const countUpdater = makeUpdater(
  (state: State) => state.count,
  count => merge({ count })
)(() => state => state.amount || 0);

const { reducer, actionCreators } = makeReducer<State, PayloadByType>({
  add: countUpdater(addUpdater),
  subtract: countUpdater(subtractUpdater),
  updateAmount: makeFTHandler(amount => merge({ amount })),
});

export const BindActionCreatorsExample: FC = () => {
  const [{ count, amount }, dispatch] = useReducer(reducer, {
    count: 0,
    amount: 1,
  });

  const drdoHandlers = bindActionCreators(dispatch, actionCreators);

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects({
    drdoHandlers,
    undoHandlers: {
      add: drdoHandlers.subtract,
      subtract: drdoHandlers.add,
      updateAmount: invertFTHandler(drdoHandlers.updateAmount),
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
```
