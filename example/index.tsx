import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useInfiniteUndo } from '../.';
import { useState, useMemo } from 'react';

interface CustomActions {
  describe: string;
}

interface Actions {
  increment: number;
  decrement: number;
}

const App = () => {
  const [amount, setAmount] = useState(1);
  const [count, setCount] = useState(0);

  //prettier-ignore
  const { 
    undo, redo, makeUndoables, stack, getCustomActions 
  } = useInfiniteUndo<CustomActions>();

  const { increment, decrement } = useMemo(
    () =>
      makeUndoables<Actions>({
        increment: {
          type: 'INCREMENT',
          do: n => setCount(count => count + n),
          undo: n => setCount(count => count - n),
          custom: {
            describe: n => `Incremented count by ${n}`,
          },
        },
        decrement: {
          do: n => setCount(count => count - n),
          undo: n => setCount(count => count + n),
          custom: {
            describe: n => `Removed ${n} from count`,
          },
        },
      }),
    [makeUndoables]
  );

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
      count: {count}
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
