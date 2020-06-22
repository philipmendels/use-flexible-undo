import React, { ReactElement, useState } from 'react';
import styled from '@emotion/styled';
import {
  ListboxInput,
  ListboxButton,
  ListboxPopover,
  ListboxList,
  ListboxOption,
} from '@reach/listbox';
import '@reach/listbox/styles.css';
import { TriangleDownIcon } from '@primer/octicons-react';

import { PayloadByType, BranchSwitchModus, History } from '../../.';
import { getLastItem, formatTime, useInterval } from './util';
import { getCurrentBranch } from '../../src/updaters';

interface BranchNavProps<PBT extends PayloadByType> {
  history: History<PBT>;
  switchToBranch: (branchId: string, travelTo?: BranchSwitchModus) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

export const BranchNav = <PBT extends PayloadByType>({
  history,
  switchToBranch,
  canUndo,
  canRedo,
  undo,
  redo,
}: BranchNavProps<PBT>): ReactElement | null => {
  const [now, setNow] = useState(new Date());
  useInterval(() => setNow(new Date()), 5000);
  const branchList = Object.values(history.branches).sort(
    (a, b) =>
      getLastItem(b.stack).created.getTime() -
      getLastItem(a.stack).created.getTime()
  );
  const currentBranch = getCurrentBranch(history);

  return (
    <div style={{ marginTop: '20px' }}>
      <ListboxStyled
        disabled={branchList.length === 1}
        value={currentBranch.id}
        onChange={id =>
          id !== currentBranch.id && switchToBranch(id, 'HEAD_OF_BRANCH')
        }
      >
        <ListboxButton arrow={<TriangleDownIcon size={16} />} />
        <ListboxPopover
          style={{ padding: 0, border: 0, outline: 'none', zIndex: 2 }}
        >
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
                }, last-modified ${formatTime(
                  getLastItem(b.stack).created,
                  now
                )})`}
              </ListboxOptionStyled>
            ))}
          </ListboxListStyled>
        </ListboxPopover>
      </ListboxStyled>
      <button disabled={!canUndo} onClick={() => undo()}>
        undo
      </button>
      <button disabled={!canRedo} onClick={() => redo()}>
        redo
      </button>
    </div>
  );
};

const ListboxStyled = styled(ListboxInput)`
  display: inline-block;
  margin-right: 10px;
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
