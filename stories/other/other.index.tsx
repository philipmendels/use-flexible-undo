import React from 'react';
import { storiesOf } from '@storybook/react';
import { DescribeActionsSwitch } from './describe-actions-switch';
import { DescribeActionsMap } from './describe-actions-map';
import { HistoryChangeExample } from './history-change';
import { MemoizationExample } from './memoization';
import { UseFlexibleUndoInverseExample } from './use-flexible-undo-inverse';

storiesOf('useUndoableEffects/other', module)
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
  .add('useFexibleUndoInverse', () => <UseFlexibleUndoInverseExample />, {
    readme: {
      // content: UsingReducerIntro,
      // sidebar: UseUndoableUnducerReadme,
    },
  });
