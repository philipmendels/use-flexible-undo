### bindSeparateActionCreators - Readme & Code

The utility **bindSeparateActionCreators** takes the dispatch function (returned by useReducer), an object with do/redo action creators by action type and a separate object with undo action creators by action type. It returns a single object with do/redo & undo handlers by action type, which can be passed to the "handlers" prop of **useUndoableEffects**.

```typescript
import React, { FC, useReducer } from 'react';
import {
  useUndoableEffects,
  PayloadFromTo,
  makeUpdater,
  makeFTHandler,
  invertFTHandler,
  makeReducer,
  bindSeparateActionCreators,
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

export const BindSeparateActionCreatorsExample: FC = () => {
  const [{ count, amount }, dispatch] = useReducer(reducer, {
    count: 0,
    amount: 1,
  });

  const handlers = bindSeparateActionCreators(dispatch, actionCreators, {
    add: actionCreators.subtract,
    subtract: actionCreators.add,
    updateAmount: invertFTHandler(actionCreators.updateAmount),
  });

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects({
    handlers,
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
