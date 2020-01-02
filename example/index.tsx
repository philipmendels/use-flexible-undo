import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useInfiniteUndo, makeUndoableReducer, useDispatchUndo } from '../.';
import { useState, useMemo, useReducer } from 'react';

interface MetaActionReturnTypeByName {
  describe: string;
}

interface PayloadByActionType {
  increment: number;
  decrement: number;
}

interface State {
  count: number;
}

const { reducer, actions, metaActions } = makeUndoableReducer<
  State,
  PayloadByActionType,
  MetaActionReturnTypeByName
>({
  increment: {
    do: n => state => ({ count: state.count + n }),
    undo: n => state => ({ count: state.count - n }),
    meta: {
      describe: n => `Incremented count by ${n}`,
    },
  },
  decrement: {
    do: n => state => ({ count: state.count - n }),
    undo: n => state => ({ count: state.count + n }),
    meta: {
      describe: n => `Removed ${n} from count`,
    },
  },
});

const App = () => {
  const [amount, setAmount] = useState(1);
  // const [count, setCount] = useState(0);
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  const dispatchUndo = useDispatchUndo(dispatch);

  //prettier-ignore
  const { 
    undo, redo, makeUndoables, makeUndoablesFromDispatch, stack, getMetaActions 
  } = useInfiniteUndo<MetaActionReturnTypeByName>();

  const { increment, decrement } = useMemo(
    () => makeUndoablesFromDispatch(dispatch, actions, metaActions),
    [makeUndoablesFromDispatch]
  );

  // const { increment, decrement } = useMemo(
  //   () =>
  //     makeUndoablesFromDispatch(dispatch, actions, {
  //       decrement: {
  //         describe: n => `Incremented count by ${n}`,
  //       },
  //       increment: {
  //         describe: n => `Removed ${n} from count`,
  //       },
  //     }),
  //   [makeUndoablesFromDispatch]
  // );

  // const { increment, decrement } = useMemo(
  //   () =>
  //     makeUndoables<PayloadByActionType>({
  //       increment: {
  //         do: n => dispatch({ type: 'increment', payload: n }),
  //         undo: n => dispatchUndo(actions.increment(n)),
  //         meta: {
  //           describe: n => `Incremented count by ${n}`,
  //         },
  //       },
  //       decrement: {
  //         do: n => dispatch(actions.decrement(n)),
  //         undo: n => dispatch(actions.decrement(n, true)),
  //         meta: {
  //           describe: n => `Removed ${n} from count`,
  //         },
  //       },
  //     }),
  //   [makeUndoables, dispatchUndo]
  // );

  // const { increment, decrement } = useMemo(
  //   () =>
  //     makeUndoables<Actions>({
  //       increment: {
  //         do: n => setCount(count => count + n),
  //         undo: n => setCount(count => count - n),
  //         custom: {
  //           describe: n => `Incremented count by ${n}`,
  //         },
  //       },
  //       decrement: {
  //         do: n => setCount(count => count - n),
  //         undo: n => setCount(count => count + n),
  //         custom: {
  //           describe: n => `Removed ${n} from count`,
  //         },
  //       },
  //     }),
  //   [makeUndoables]
  // );

  // const increment = makeUndoable<number>({
  //   type: 'INCREMENT',
  //   do: n => setCount(count => count + n),
  //   undo: n => setCount(count => count - n),
  //   custom: {
  //     describe: n => `Incremented count by ${n}`,
  //   },
  // });

  // const decrement = useMemo(
  //   () =>
  //     makeUndoable<number>({
  //       type: 'DECREMENT',
  //       do: n => setCount(count => count - n),
  //       undo: n => setCount(count => count + n),
  //       custom: {
  //         describe: n => `Removed ${n} from count`,
  //       },
  //     }),
  //   [makeUndoable]
  // );

  return (
    <div>
      <label>
        amount:{' '}
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
        />
      </label>
      <button onClick={() => increment(amount)}> increment </button>
      <button onClick={() => decrement(amount)}> decrement </button>
      <button onClick={() => undo()}> undo </button>
      <button onClick={() => redo()}> redo </button>
      count: {state.count}
      <br />
      <br />
      {stack.future.map((item, index) => (
        <div key={index} style={{ color: '#DDD' }}>
          {getMetaActions(item).describe()}
        </div>
      ))}
      {stack.past.map((item, index) => (
        <div key={index}>{getMetaActions(item).describe()}</div>
      ))}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
