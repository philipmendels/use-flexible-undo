import React, {
  useState,
  useEffect,
  useRef,
  ReactElement,
  ReactNode,
} from 'react';
import styled from '@emotion/styled';
import { Action, TimeTravelFn, Stack } from '../../src/index.types';

type ConvertFn<A> = (action: A) => ReactNode;

interface ActionListProps<A extends Action> {
  stack: Stack<A>;
  timeTravel: TimeTravelFn;
  convert?: ConvertFn<A>;
}

export const ActionList = <A extends Action>({
  stack,
  timeTravel,
  convert,
}: ActionListProps<A>): ReactElement | null => {
  const [now, setNow] = useState(new Date());
  useInterval(() => setNow(new Date()), 5000);
  const hasPast = stack.past.length > 0;
  const hasFuture = stack.future.length > 0;
  return (
    <Root>
      {stack.future.map((action, index) => (
        <div
          key={index}
          style={{ cursor: 'pointer' }}
          onClick={() => timeTravel('future', index)}
        >
          <StackItem action={action} now={now} convert={convert} />
        </div>
      ))}
      <Present>
        {hasPast && <>undoable past &darr;</>}
        {hasPast && hasFuture && ' '}
        {hasFuture && <>&uarr; redoable future</>}
        {(hasPast || hasFuture) && ' - click on an item to time travel'}
      </Present>
      {stack.past.map((action, index) => (
        <div
          key={index}
          style={{ cursor: 'pointer' }}
          onClick={() => timeTravel('past', index)}
        >
          <StackItem action={action} now={now} convert={convert} />
        </div>
      ))}
    </Root>
  );
};

const Root = styled.div`
  /* font-size: 12px; */
`;

const Present = styled.div`
  color: #48a7f6;
  padding: 8px 0px;
`;

interface StackItemProps<A extends Action> {
  action: A;
  now: Date;
  convert?: ConvertFn<A>;
}

const StackItem = <A extends Action>({
  action,
  now,
  convert,
}: StackItemProps<A>): ReactElement | null => {
  const { created, type, payload } = action;
  return (
    <StackItemRoot>
      {Boolean(created) && (
        <div style={{ color: '#BBB', minWidth: '120px' }}>
          {formatTime(created!, now)}
        </div>
      )}
      <div style={{ flex: 1, whiteSpace: 'nowrap' }}>
        {convert ? convert(action) : JSON.stringify({ type, payload })}
      </div>
    </StackItemRoot>
  );
};

const StackItemRoot = styled.div`
  padding: 8px 0px;
  display: flex;
  &:hover {
    background: #f7f8fa;
  }
`;

// From: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
const useInterval = (callback: (...args: any[]) => any, delay: number) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
    return undefined;
  }, [delay]);
};

const formatTime = (created: Date, now: Date): string => {
  const diffSecs = (now.getTime() - created.getTime()) / 1000;
  if (diffSecs < 5) {
    return `a moment ago`;
  }
  if (diffSecs < 57.5) {
    return `${Math.round(diffSecs / 5) * 5} seconds ago`;
  }
  const diffMinutes = diffSecs / 60;
  if (diffMinutes < 60) {
    const d = Math.round(diffMinutes);
    return `${d} minute${getPluralString(d)} ago`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  return `${diffHours} hour${getPluralString(diffHours)} ago`;
};

const getPluralString = (amount: number) => (amount === 1 ? '' : 's');
