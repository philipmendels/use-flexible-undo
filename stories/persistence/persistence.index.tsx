import React from 'react';
import { storiesOf } from '@storybook/react';
import { InitialStackExample } from './initial-stack';
import { LocalStorageExample } from './local-storage';
import { ReviveStateExample } from './revive-state';

storiesOf('useFlexibleUndo/persistence', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
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
