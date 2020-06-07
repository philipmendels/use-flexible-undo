import React from 'react';
import { storiesOf } from '@storybook/react';
import { MemoizationExample } from './memo';
import MemoizationReadme from './memo.md';
import { MemoizationLatestExample } from './memo-latest';
import MemoizationLatestReadme from './memo-latest.md';
import { Memoization2Example } from './memo-2';
import Memoization2Readme from './memo-2.md';
import { Memoization3Example } from './memo-3';
import Memoization3Readme from './memo-3.md';
import { Memoization4Example } from './memo-4';
import Memoization4Readme from './memo-4.md';

storiesOf('useFlexibleUndo/memoization', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add('memo', () => <MemoizationExample />, {
    readme: {
      sidebar: MemoizationReadme,
    },
  })
  .add('memo latest', () => <MemoizationLatestExample />, {
    readme: {
      sidebar: MemoizationLatestReadme,
    },
  })
  .add('memo 2', () => <Memoization2Example />, {
    readme: {
      sidebar: Memoization2Readme,
    },
  })
  .add('memo 3', () => <Memoization3Example />, {
    readme: {
      sidebar: Memoization3Readme,
    },
  })
  .add('memo 4', () => <Memoization4Example />, {
    readme: {
      sidebar: Memoization4Readme,
    },
  });
