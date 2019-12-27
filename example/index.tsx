import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useInfiniteUndo } from '../.';
import { useState, useMemo } from 'react';

const App = () => {
  const [amount, setAmount] = useState(1);
  const [count, setCount] = useState(0);
  const { undo, redo, makeUndoable, stack } = useInfiniteUndo();
  const increment = makeUndoable<number>({
    type: 'INCREMENT',
    do: n => setCount(count => count + n),
    undo: n => setCount(count => count - n),
  });

  const decrement = useMemo(
    () =>
      makeUndoable<number>({
        type: 'DECREMENT',
        do: n => setCount(count => count - n),
        undo: n => setCount(count => count + n),
      }),
    [makeUndoable]
  );

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
      {stack.future.map(item => (
        <div style={{ color: '#DDD' }}>
          {item.type} payload: {item.payload}
        </div>
      ))}
      {stack.past.map(item => (
        <div>
          {item.type} payload: {item.payload}
        </div>
      ))}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
