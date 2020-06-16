import React, {
  useState,
  useEffect,
  useRef,
  ReactElement,
  ReactNode,
} from 'react';
import styled from '@emotion/styled';
import {
  PayloadByType,
  ActionUnion,
  History,
  BranchConnection,
  BranchSwitchModus,
} from '../../.';
import {
  getCurrentBranch,
  getCurrentIndex,
  getSideBranches,
} from '../../src/updaters';

type ConvertFn<PBT extends PayloadByType> = (
  action: ActionUnion<PBT>
) => ReactNode;

interface ActionListProps<PBT extends PayloadByType> {
  history: History<PBT>;
  timeTravel: (index: number, branchId?: string) => void;
  switchToBranch: (branchId: string, travelTo?: BranchSwitchModus) => void;
  startTime?: Date;
  describeAction?: ConvertFn<PBT>;
}

export const ActionList = <PBT extends PayloadByType>({
  history,
  timeTravel,
  switchToBranch,
  describeAction,
  startTime,
}: ActionListProps<PBT>): ReactElement | null => {
  const startTimeRef = useRef(new Date());
  const [now, setNow] = useState(new Date());
  useInterval(() => setNow(new Date()), 5000);

  const currentBranch = getCurrentBranch(history);
  const stack = currentBranch.stack;
  const currentIndex = getCurrentIndex(history);

  const connections = getSideBranches(currentBranch.id, true)(history);

  return (
    <div style={{ position: 'relative' }}>
      {stack
        .slice()
        .reverse()
        .map((action, index) => (
          <StackItem
            action={action}
            isCurrent={history.currentPosition.actionId === action.id}
            timeTravel={() => {
              timeTravel(stack.length - 1 - index);
            }}
            now={now}
            describeAction={describeAction}
            connections={connections.filter(
              c => c.position.actionId === action.id
            )}
            switchToBranch={switchToBranch}
          />
        ))}
      <StackItem
        action={{
          created: startTime || startTimeRef.current,
          type: 'start',
          id: 'start',
        }}
        isCurrent={currentIndex === -1}
        timeTravel={() => timeTravel(-1)}
        now={now}
        describeAction={() => 'start'}
        connections={[]}
        switchToBranch={() => {}}
      />

      <Indicator
        style={{ top: 2 + (stack.length - currentIndex - 1) * 32 + 'px' }}
      >
        &#11157;
      </Indicator>
    </div>
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

interface StackItemProps<PBT extends PayloadByType> {
  action: ActionUnion<PBT>;
  now: Date;
  connections: BranchConnection<PBT>[];
  switchToBranch: (branchId: string) => void;
  timeTravel: () => void;
  isCurrent: boolean;
  describeAction?: ConvertFn<PBT>;
}

const StackItem = <PBT extends PayloadByType>({
  action,
  isCurrent,
  now,
  describeAction,
  connections,
  timeTravel,
  switchToBranch,
}: StackItemProps<PBT>): ReactElement | null => {
  const { created, type, payload } = action;
  return (
    <StackItemRoot isCurrent={isCurrent} onClick={timeTravel}>
      {connections.map(con => (
        <div
          key={con.branches[0].id}
          style={{
            border: '1px solid #48a7f6',
            padding: '2px 6px',
            alignSelf: 'center',
            borderRadius: '6px',
            marginRight: '16px',
          }}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            switchToBranch(con.branches[0].id);
          }}
        >
          {con.branches.length}
        </div>
      ))}
      <div style={{ flex: 1, display: 'flex' }}>
        <div className="time" style={{ minWidth: '120px' }}>
          {formatTime(created, now)}
        </div>
        <div className="description" style={{ flex: 1, whiteSpace: 'nowrap' }}>
          {describeAction
            ? describeAction(action)
            : JSON.stringify({ type, payload })}
        </div>
      </div>
    </StackItemRoot>
  );
};

const StackItemRoot = styled.div<{ isCurrent: boolean }>`
  display: flex;
  padding: 8px 0px;
  height: 32px;
  box-sizing: border-box;
  padding: 8px 25px;
  &:hover {
    background: #f7f8fa;
  }
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
