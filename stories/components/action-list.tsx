import React, {
  useState,
  useEffect,
  useRef,
  ReactElement,
  ReactNode,
} from 'react';
import styled from '@emotion/styled';
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button';
import '@reach/menu-button/styles.css';
import {
  ListboxInput,
  ListboxButton,
  ListboxPopover,
  ListboxList,
  ListboxOption,
} from '@reach/listbox';
import '@reach/listbox/styles.css';
import {
  PayloadByType,
  ActionUnion,
  History,
  BranchConnection,
  BranchSwitchModus,
} from '../../.';
import { GitBranchIcon, TriangleDownIcon } from '@primer/octicons-react';
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
  describeAction?: ConvertFn<PBT>;
}

export const ActionList = <PBT extends PayloadByType>({
  history,
  timeTravel,
  switchToBranch,
  describeAction,
}: ActionListProps<PBT>): ReactElement | null => {
  const [now, setNow] = useState(new Date());
  useInterval(() => setNow(new Date()), 5000);

  const currentBranch = getCurrentBranch(history);
  const stack = currentBranch.stack;
  const currentIndex = getCurrentIndex(history);

  const connections = getSideBranches(currentBranch.id, true)(history);
  const branchList = Object.values(history.branches);
  return (
    <>
      <div style={{ marginBottom: '8px' }}>
        <ListboxStyled
          disabled={branchList.length === 1}
          value={currentBranch.id}
          onChange={id => id !== currentBranch.id && switchToBranch(id)}
        >
          <ListboxButton arrow={<TriangleDownIcon size={16} />} />
          <ListboxPopover style={{ padding: 0, border: 0, outline: 'none' }}>
            <ListboxListStyled>
              {branchList.map(b => (
                <ListboxOptionStyled
                  key={b.id}
                  value={b.id}
                  label={`branch ${b.number}`}
                >
                  {`branch ${b.number} (size ${
                    b.parent
                      ? b.parent.position.globalIndex + b.stack.length
                      : b.stack.length
                  })`}
                </ListboxOptionStyled>
              ))}
            </ListboxListStyled>
          </ListboxPopover>
        </ListboxStyled>
      </div>

      <div style={{ position: 'relative' }}>
        {stack
          .slice()
          .reverse()
          .map((action, index) => (
            <StackItem
              key={action.id}
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

        <Indicator
          style={{ top: 2 + (stack.length - currentIndex - 1) * 32 + 'px' }}
        >
          &#11157;
        </Indicator>
      </div>
    </>
  );
};

const ListboxStyled = styled(ListboxInput)`
  [data-reach-listbox-button] {
    background: white;
    padding: 4px 8px;
    cursor: pointer;
    &[aria-disabled] {
      cursor: default;
    }
    &:focus {
      outline: 1px solid #48a7f6;
    }
    &:hover {
      background: #f7f8fa;
    }
  }
`;

const ListboxListStyled = styled(ListboxList)`
  padding: 0;
  border: 1px solid #48a7f6;
  box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.1);
`;

const ListboxOptionStyled = styled(ListboxOption)`
  font-family: Verdana, sans-serif;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 16px;
  border: 0;
  &[aria-selected='true'] {
    background: #f7f8fa;
    color: black;
  }
  &[data-current] {
    color: white;
    background: #48a7f6;
    font-weight: normal;
    cursor: default;
  }
`;

const Indicator = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
  color: #48a7f6;
  font-size: 16px;
  opacity: 0.8;
  position: absolute;
  left: 30px;
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
    <StackItemRoot>
      <div
        style={{
          color: '#48a7f6',
          padding: '8px 0',
          flex: '0 0 52px',
        }}
      >
        {connections.length > 0 && (
          <Menu>
            <MenuButton>
              <GitBranchIcon size={16} />
            </MenuButton>
            <MenuListStyled>
              {connections.map(c => (
                <MenuItemStyled
                  onSelect={() => switchToBranch(c.branches[0].id)}
                >
                  {`Switch to branch ${c.branches
                    .map(b => b.number)
                    .join(', ')
                    .replace(/,(?=[^,]*$)/, ' and')}`}
                </MenuItemStyled>
              ))}
            </MenuListStyled>
          </Menu>
        )}
      </div>
      <StackItemContent isCurrent={isCurrent} onClick={timeTravel}>
        <div className="time" style={{ minWidth: '120px' }}>
          {formatTime(created, now)}
        </div>
        <div className="description" style={{ flex: 1, whiteSpace: 'nowrap' }}>
          {describeAction
            ? describeAction(action)
            : JSON.stringify({ type, payload })}
        </div>
      </StackItemContent>
    </StackItemRoot>
  );
};

const StackItemRoot = styled.div`
  display: flex;
  height: 32px;
  box-sizing: border-box;
  [data-reach-menu-button] {
    display: flex;
    color: #48a7f6;
    background: transparent;
    border: none;
    padding: 2px;
    cursor: pointer;
    &:focus {
      outline: none;
    }
    &:hover {
      background: #f7f8fa;
    }
    &[aria-expanded='true'] {
      color: white;
      background: #48a7f6;
    }
  }
`;

const MenuListStyled = styled(MenuList)`
  padding: 0;
  border: 1px solid #48a7f6;
  box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.1);
`;

const MenuItemStyled = styled(MenuItem)`
  font-family: Verdana, sans-serif;
  padding: 8px 16px;
  &[data-selected] {
    background: #f7f8fa;
    color: black;
  }
`;

const StackItemContent = styled.div<{ isCurrent: boolean }>`
  padding: 8px;
  display: flex;
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
