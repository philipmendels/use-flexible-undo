import React from 'react';
import { storiesOf } from '@storybook/react';
import { DescribeActionsSwitch } from './describe-actions-switch';
import { DescribeActionsMap } from './describe-actions-map';
import { HistoryChangeExample } from './history-change';
import { MemoizationExample } from './memoization';
import { UseUndoableUnducerExample } from './use-undoable-unducer';
import UseUndoableUnducerReadme from './use-undoable-unducer.md';
import { UseUndoableReducerExample } from './use-undoable-reducer';
import UseUndoableReducerReadme from './use-undoable-reducer.md';

storiesOf('useFlexibleUndo/other', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add('describe-actions-switch', () => <DescribeActionsSwitch />, {
    readme: {
      // content: UsingReducerIntro,
      // sidebar: UsingReducerReadme,
    },
  })
  .add('describe-actions-map', () => <DescribeActionsMap />, {
    readme: {
      // content: UsingReducerIntro,
      // sidebar: UsingReducerReadme,
    },
  })
  .add('history-change', () => <HistoryChangeExample />, {
    readme: {
      // content: UsingReducerIntro,
      // sidebar: UsingReducerReadme,
    },
  })
  .add('memoization', () => <MemoizationExample />, {
    readme: {
      // content: UsingReducerIntro,
      // sidebar: UsingReducerReadme,
    },
  })
  .add('useUndoableUnducer', () => <UseUndoableUnducerExample />, {
    readme: {
      // content: UsingReducerIntro,
      sidebar: UseUndoableUnducerReadme,
    },
  })
  .add('useUndoableReducer', () => <UseUndoableReducerExample />, {
    readme: {
      // content: UsingReducerIntro,
      sidebar: UseUndoableReducerReadme,
    },
  });
