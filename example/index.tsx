import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useInfiniteUndo, makeUndoableReducer, CB } from '../.';
import { useState, useMemo, useReducer } from 'react';

interface MetaActionReturnTypes {
  describe: string;
}

interface PayloadByType {
  increment: number;
  decrement: number;
}

interface PayloadByType2 {
  blaat: string;
  bloop: boolean;
}

interface PayloadByTypeUnused {
  bleep: object;
}

type PayloadByTypeFull = { blurb: boolean } & PayloadByType & PayloadByType2;

interface State {
  count: number;
}

const { reducer, actionCreators, metaActionHandlers } = makeUndoableReducer<
  State,
  PayloadByType,
  MetaActionReturnTypes
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

const callback: CB<PayloadByTypeFull, MetaActionReturnTypes> = ({
  action,
  eventName,
  meta,
}) => console.log(`${eventName} ${action.type}: ${meta.describe()}`);

const App = () => {
  const [amount, setAmount] = useState(1);
  // const [count, setCount] = useState(0);
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  // const { state, boundActionCreators } = useUndoableReducer(
  //   reducer,
  //   { count: 0 },
  //   actionCreators
  // );

  const {
    undo,
    redo,
    makeUndoable,
    makeUndoables,
    makeUndoablesFromDispatch,
    stack,
    getMetaActionHandlers,
  } = useInfiniteUndo<PayloadByTypeFull, MetaActionReturnTypes>({
    // onMakeUndoable: type => console.log('make ', type),
    onDoRedo: callback,
    onUnDo: callback,
  });

  const { increment, decrement } = useMemo(
    () =>
      makeUndoablesFromDispatch(dispatch, actionCreators, metaActionHandlers),
    [makeUndoablesFromDispatch]
  );

  const { blaat, bloop } = useMemo(
    () =>
      makeUndoables<PayloadByType2>({
        blaat: {
          do: n => {},
          undo: n => {},
          meta: {
            describe: n => ``,
          },
        },
        bloop: {
          do: n => {},
          undo: n => {},
          meta: {
            describe: n => ``,
          },
        },
      }),
    [makeUndoables]
  );

  const blurb = makeUndoable<boolean>({
    type: 'blurb',
    do: n => {},
    undo: n => {},
    meta: {
      describe: n => ``,
    },
  });

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
      {stack.future.map((action, index) => (
        <div key={index} style={{ color: '#DDD' }}>
          {getMetaActionHandlers(action).describe()}
        </div>
      ))}
      {stack.past.map((action, index) => (
        <div key={index}>{getMetaActionHandlers(action).describe()}</div>
      ))}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
