import React from 'react';
import { storiesOf } from '@storybook/react';
// import { DescribeActionsSwitch } from './describe-actions-switch';
// import { DescribeActionsMap } from './describe-actions-map';
// import { HistoryChangeExample } from './history-change';
// import { MemoizationExample } from './memoization';
import { UnducerExample } from './unducer';

storiesOf('useFlexibleUndo/other', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  // .add('describe-actions-switch', () => <DescribeActionsSwitch />, {
  //   readme: {
  //     // content: UsingReducerIntro,
  //     // sidebar: UsingReducerReadme,
  //   },
  // })
  // .add('describe-actions-map', () => <DescribeActionsMap />, {
  //   readme: {
  //     // content: UsingReducerIntro,
  //     // sidebar: UsingReducerReadme,
  //   },
  // })
  // .add('histrory-change', () => <HistoryChangeExample />, {
  //   readme: {
  //     // content: UsingReducerIntro,
  //     // sidebar: UsingReducerReadme,
  //   },
  // })
  // .add('memoization', () => <MemoizationExample />, {
  //   readme: {
  //     // content: UsingReducerIntro,
  //     // sidebar: UsingReducerReadme,
  //   },
  // })
  .add('unducer', () => <UnducerExample />, {
    readme: {
      // content: UsingReducerIntro,
      // sidebar: UsingReducerReadme,
    },
  });
