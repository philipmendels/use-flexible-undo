import React from 'react';
import { storiesOf } from '@storybook/react';

import { MemoizationExample } from './memoization';
import MemoizationIntro from './memoization.intro.md';
import MemoizationReadme from './memoization.md';

import { InitialHistoryExample } from './initial-history';
import InitialHistoryIntro from './initial-history.intro.md';
import InitialHistoryReadme from './initial-history.md';

import { InitialHistoryTypedExample } from './initial-history-typed';
import InitialHistoryTypedReadme from './initial-history-typed.md';

import { LocalStorageExample } from './local-storage';
import LocalStorageIntro from './local-storage.intro.md';
import LocalStorageReadme from './local-storage.md';

import { ReviveStateExample } from './revive-state';

storiesOf('useUndoableEffects/memoization & persistence', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add('memoization', () => <MemoizationExample />, {
    readme: {
      content: MemoizationIntro,
      sidebar: MemoizationReadme,
    },
  })
  .add('initialHistory parsed', () => <InitialHistoryExample />, {
    readme: {
      content: InitialHistoryIntro,
      sidebar: InitialHistoryReadme,
    },
  })
  .add('initialHistory typed', () => <InitialHistoryTypedExample />, {
    readme: {
      // content: InitialHistoryTypedIntro,
      sidebar: InitialHistoryTypedReadme,
    },
  })
  .add('setHistory from localStorage', () => <LocalStorageExample />, {
    readme: {
      content: LocalStorageIntro,
      sidebar: LocalStorageReadme,
    },
  })
  .add('recreate state', () => <ReviveStateExample />, {
    readme: {
      // sidebar: MakeUndoablesMeta1Readme,
    },
  });
