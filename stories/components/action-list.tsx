import React, { useState, ReactElement, ReactNode } from 'react';
import styled from '@emotion/styled';
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button';
import '@reach/menu-button/styles.css';
import {
  PayloadByType,
  HistoryItemUnion,
  History,
  BranchConnection,
  BranchSwitchModus,
} from '../../.';
import { GitBranchIcon, DotIcon } from '@primer/octicons-react';
import {
  getCurrentBranch,
  getCurrentIndex,
  getSideBranches,
} from '../../src/updaters';
import { formatTime, useInterval } from './util';

type ConvertFn<PBT extends PayloadByType> = (
  action: HistoryItemUnion<PBT>
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

  return (
    <div
      style={{
        position: 'relative',
        marginTop: '10px',
        paddingBottom: '20px',
        width: '100%',
        overflow: 'auto',
      }}
    >
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
  );
};

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
  action: HistoryItemUnion<PBT>;
  now: Date;
  connections: BranchConnection<PBT>[];
  switchToBranch: (branchId: string, travelTo?: BranchSwitchModus) => void;
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
        {connections.length > 0 ? (
          <Menu>
            <MenuButton>
              <GitBranchIcon size={16} />
            </MenuButton>
            <MenuListStyled>
              {connections.map(c => (
                <MenuItemStyled
                  key={c.branches[0].id}
                  onSelect={() =>
                    switchToBranch(c.branches[0].id, 'LAST_COMMON_ACTION')
                  }
                >
                  {`Switch to branch ${c.branches
                    .map(b => b.number)
                    .join(', ')
                    .replace(/,(?=[^,]*$)/, ' and')}`}
                </MenuItemStyled>
              ))}
            </MenuListStyled>
          </Menu>
        ) : (
          <span
            style={{
              color: '#bbb',
              marginLeft: '1px',
              display: 'inline-block',
            }}
          >
            <DotIcon size={10} verticalAlign="middle" />
          </span>
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
