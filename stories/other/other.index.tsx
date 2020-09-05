import React from 'react';
import { storiesOf } from '@storybook/react';
import { MemoizationExample } from './memoization';
import { InitialStackExample } from './initial-stack';
import { LocalStorageExample } from './local-storage';
import { ReviveStateExample } from './revive-state';

storiesOf('useUndoableEffects/memoization & persistence', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add('memoization', () => <MemoizationExample />, {
    readme: {
      // content: UsingReducerIntro,
      // sidebar: UsingReducerReadme,
    },
  })
  .add('intial stack', () => <InitialStackExample />, {
    readme: {
      // sidebar: MakeUndoablesMeta1Readme,
    },
  })
  .add('local storage', () => <LocalStorageExample />, {
    readme: {
      // sidebar: MakeUndoablesMeta1Readme,
    },
  })
  .add('revive state', () => <ReviveStateExample />, {
    readme: {
      // sidebar: MakeUndoablesMeta1Readme,
    },
  });
