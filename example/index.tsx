import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useInfiniteUndo, makeUndoableReducer, useDispatchUndo } from '../.';
import { useState, useMemo, useReducer } from 'react';

interface CustomActions {
  describe: string;
}

interface Actions {
  increment: number;
  decrement: number;
}

interface State {
  count: number;
}

const { reducer, actions } = makeUndoableReducer<State, Actions>({
  increment: {
    do: n => state => ({ count: state.count + n }),
    undo: n => state => ({ count: state.count - n }),
  },
  decrement: {
    do: n => state => ({ count: state.count - n }),
    undo: n => state => ({ count: state.count + n }),
  },
});

const App = () => {
  const [amount, setAmount] = useState(1);
  // const [count, setCount] = useState(0);
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  const dispatchUndo = useDispatchUndo(dispatch);

  //prettier-ignore
  const { 
    undo, redo, makeUndoables, stack, getCustomActions 
  } = useInfiniteUndo<CustomActions>();

  const { increment, decrement } = useMemo(
    () =>
      makeUndoables<Actions>({
        increment: {
          do: n => dispatch({ type: 'increment', payload: n }),
          undo: n => dispatchUndo(actions.increment(n)),
          custom: {
            describe: n => `Incremented count by ${n}`,
          },
        },
        decrement: {
          do: n => dispatch(actions.decrement(n)),
          undo: n => dispatch(actions.decrement(n, true)),
          custom: {
            describe: n => `Removed ${n} from count`,
          },
        },
      }),
    [makeUndoables, dispatchUndo]
  );

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
          {getCustomActions(item).describe()}
        </div>
      ))}
      {stack.past.map((item, index) => (
        <div key={index}>{getCustomActions(item).describe()}</div>
      ))}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
