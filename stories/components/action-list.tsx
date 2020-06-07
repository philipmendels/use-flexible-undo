import React, {
  useState,
  useEffect,
  useRef,
  ReactElement,
  ReactNode,
} from 'react';
import styled from '@emotion/styled';
import { Action, PayloadByType, ActionUnion } from '../../dist';
import { History, BranchConnection } from '../../src';
import {
  isUndoPossible,
  isRedoPossible,
  getCurrentBranch,
  getCurrentIndex,
  getSideBranches,
} from '../../src/updaters';

type ConvertFn<A> = (action: A) => ReactNode;

interface ActionListProps<PBT extends PayloadByType> {
  history: History<PBT>;
  timeTravel: (index: number) => void;
  switchToBranch: (branchId: string) => void;
  startTime?: Date;
  convert?: ConvertFn<ActionUnion<PBT>>;
}

type Modus = 'clickBetween' | 'clickOn';

export const ActionList = <PBT extends PayloadByType>({
  history,
  timeTravel,
  switchToBranch,
  convert,
  startTime,
}: ActionListProps<PBT>): ReactElement | null => {
  const [modus, setModus] = useState<Modus>('clickOn');
  const startTimeRef = useRef(new Date());
  const [now, setNow] = useState(new Date());
  const [mouseMoved, setMouseMoved] = useState(false);
  useInterval(() => setNow(new Date()), 5000);
  const hasPast = isUndoPossible(history);
  const hasFuture = isRedoPossible(history);
  const currentBranch = getCurrentBranch(history);
  const stack = currentBranch.stack;
  const currentIndex = getCurrentIndex(history);

  const connections = getSideBranches(currentBranch.id, true)(history);

  const mapConnections = (cons: BranchConnection<PBT>[], list: typeof stack) =>
    list.map(item => ({
      ...item,
      connections: cons.find(c => c.position.actionId === item.id)?.branches,
      switchToBranch,
    }));

  const past = mapConnections(
    connections,
    stack.slice(0, currentIndex + 1).reverse()
  );
  const future = mapConnections(
    connections,
    stack.slice(currentIndex + 1, stack.length).reverse()
  );

  return (
    <>
      {(hasPast || hasFuture) && (
        <>
          <div
            style={{
              marginTop: '30px',
              marginBottom: '16px',
            }}
          >
            <label>
              time-travel modus: &nbsp;
              <select
                value={modus}
                onChange={e => setModus(e.currentTarget.value as any)}
                style={{ fontSize: '14px', padding: '4px' }}
              >
                <option value="clickOn">Last of the past</option>
                <option value="clickBetween">Move the present</option>
              </select>
            </label>
          </div>
        </>
      )}
      <div style={{ position: 'relative' }}>
        {future.map((action, index) => (
          <StackItemWrapper
            key={index}
            mouseMoved={mouseMoved}
            onMouseMove={() => setMouseMoved(true)}
            onClick={() => {
              setMouseMoved(false);
              timeTravel(past.length + (future.length - 1 - index));
            }}
          >
            {modus === 'clickBetween' && (
              <Spacer>
                <div className="line"></div>
              </Spacer>
            )}
            <StackItem
              action={action}
              now={now}
              convert={convert}
              modus={modus}
            />
          </StackItemWrapper>
        ))}
        {modus === 'clickBetween' && (
          <Present>
            {hasPast && <>undoable past &darr;</>}
            {hasPast && hasFuture && ' '}
            {hasFuture && <>&uarr; redoable future</>}
            {(hasPast || hasFuture) && ' - click to time travel'}
          </Present>
        )}
        {past.map((action, index) => (
          <StackItemWrapper
            key={index}
            onMouseMove={() => setMouseMoved(true)}
            onClick={() => {
              setMouseMoved(false);
              const indexR = past.length - 1 - index;
              timeTravel(modus === 'clickOn' ? indexR : indexR - 1);
            }}
            mouseMoved={mouseMoved}
            isCurrent={index === 0 && modus === 'clickOn'}
          >
            <StackItem
              action={action}
              now={now}
              convert={convert}
              modus={modus}
            />
            {modus === 'clickBetween' && (
              <Spacer>
                <div className="line"></div>
              </Spacer>
            )}
          </StackItemWrapper>
        ))}
        {modus === 'clickOn' && (hasPast || hasFuture) && (
          <>
            <StackItemWrapper
              onMouseMove={() => setMouseMoved(true)}
              onClick={() => {
                setMouseMoved(false);
                timeTravel(-1);
              }}
              mouseMoved={mouseMoved}
              isCurrent={past.length === 0}
            >
              <StackItemRoot modus="clickOn">
                <div className="time" style={{ minWidth: '120px' }}>
                  {formatTime(startTime || startTimeRef.current, now)}
                </div>
                <div
                  className="description"
                  style={{ flex: 1, whiteSpace: 'nowrap' }}
                >
                  start
                </div>
              </StackItemRoot>
            </StackItemWrapper>
            <Indicator style={{ top: 2 + future.length * 32 + 'px' }}>
              &#11157;
            </Indicator>
          </>
        )}
      </div>
    </>
  );
};

const Indicator = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
  z-index: 10;
  color: #48a7f6;
  font-size: 16px;
  opacity: 0.8;
  position: absolute;
  left: 0px;
  border-radius: 50%;
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
`;

const Present = styled.div`
  color: #48a7f6;
  padding: 8px 0px;
`;

interface StackItemProps<A extends Action> {
  action: A;
  now: Date;
  modus: Modus;
  isCurrent?: boolean;
  convert?: ConvertFn<A>;
}

const StackItem = <A extends Action>({
  action,
  now,
  convert,
  modus,
}: StackItemProps<A>): ReactElement | null => {
  const { created, type, payload } = action;
  const connections: any[] = (action as any).connections || [];
  return (
    <StackItemRoot modus={modus}>
      <div
        style={{ width: '30px' }}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          connections.length &&
            (action as any).switchToBranch(connections[0].id);
        }}
      >
        {connections.length}
      </div>
      {Boolean(created) && (
        <div className="time" style={{ minWidth: '120px' }}>
          {formatTime(created!, now)}
        </div>
      )}
      <div className="description" style={{ flex: 1, whiteSpace: 'nowrap' }}>
        {convert ? convert(action) : JSON.stringify({ type, payload })}
      </div>
    </StackItemRoot>
  );
};

const StackItemRoot = styled.div<{ modus: Modus }>`
  display: flex;
  padding: 8px 0px;
  height: 32px;
  box-sizing: border-box;
  ${({ modus }) =>
    modus === 'clickOn' &&
    `
    padding: 8px 25px;
    &:hover {
      background: #f7f8fa;
    }`}
`;

interface StackItemWrapperProps {
  isCurrent?: boolean;
  mouseMoved: boolean;
}

const StackItemWrapper = styled.div<StackItemWrapperProps>`
  cursor: pointer;
  .time {
    color: ${({ isCurrent }) => (isCurrent ? '#48a7f6' : '#BBB')};
  }
  ${({ isCurrent }) =>
    isCurrent &&
    `
    color: #48a7f6;
    cursor: default;
    `}
  ${({ mouseMoved }) =>
    mouseMoved &&
    `&:hover .line {
    border-bottom: 1px dashed #48a7f6;
  }`}
`;

const Spacer = styled.div`
  position: relative;
  height: 32px;
  margin: -16px 0;
  z-index: 1;
  cursor: pointer;
  div {
    height: 50%;
  }
  &:hover div {
    border-bottom: 1px dashed #48a7f6;
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
