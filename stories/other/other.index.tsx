import React from 'react';
import { storiesOf } from '@storybook/react';

import { MemoizationExample } from './memoization';
import MemoizationIntro from './memoization.intro.md';
import MemoizationReadme from './memoization.md';

import { InitialStackExample } from './initial-stack';
import { LocalStorageExample } from './local-storage';
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
