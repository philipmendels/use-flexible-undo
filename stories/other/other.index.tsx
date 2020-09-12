import React from 'react';
import { storiesOf } from '@storybook/react';

import { MemoizationExample } from './memoization';
import MemoizationIntro from './memoization.intro.md';
import MemoizationReadme from './memoization.md';

import { HistoryChangeExample } from '../other/history-change';
import HistoryChangeReadme from '../other/history-change.md';
import HistoryChangeIntro from '../other/history-change.intro.md';

import { InitialHistoryExample } from './initial-history';
import InitialHistoryIntro from './initial-history.intro.md';
import InitialHistoryReadme from './initial-history.md';

import { InitialHistoryTypedExample } from './initial-history-typed';
import InitialHistoryTypedIntro from './initial-history-typed.intro.md';
import InitialHistoryTypedReadme from './initial-history-typed.md';

import { LocalStorageExample } from './local-storage';
import LocalStorageIntro from './local-storage.intro.md';
import LocalStorageReadme from './local-storage.md';

import { RestoreStateFromHistoryExample } from './revive-state';
import RestoreStateFromHistoryReadme from './revive-state.md';
import RestoreStateFromHistoryIntro from './revive-state.intro.md';

storiesOf('useUndoableEffects/memoization, logging & persistence', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add('memoization', () => <MemoizationExample />, {
    readme: {
      content: MemoizationIntro,
      sidebar: MemoizationReadme,
    },
  })
  .add('logging history state changes', () => <HistoryChangeExample />, {
    readme: {
      content: HistoryChangeIntro,
      sidebar: HistoryChangeReadme,
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
      content: InitialHistoryTypedIntro,
      sidebar: InitialHistoryTypedReadme,
    },
  })
  .add('setHistory from localStorage', () => <LocalStorageExample />, {
    readme: {
      content: LocalStorageIntro,
      sidebar: LocalStorageReadme,
    },
  })
  .add(
    'restore application state from history',
    () => <RestoreStateFromHistoryExample />,
    {
      readme: {
        content: RestoreStateFromHistoryIntro,
        sidebar: RestoreStateFromHistoryReadme,
      },
    }
  );
