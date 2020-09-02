import React from 'react';
import { storiesOf } from '@storybook/react';
import { TimeTravelByIdExample } from './time-travel-by-id';
import { TimeTravelByIndexExample } from './time-travel-by-index';
import { SwitchToBranchExample } from './switch-to-branch';

storiesOf('useUndoableEffects/history and time travel', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add('time travel by id', () => <TimeTravelByIdExample />, {
    readme: {
      // content:
      // sidebar: ReducerAndMakeUpdaterReadme,
    },
  })
  .add('time travel by index', () => <TimeTravelByIndexExample />, {
    readme: {
      // content:
      // sidebar: ReducerAndMakeUpdaterReadme,
    },
  })
  .add('switch branch', () => <SwitchToBranchExample />, {
    readme: {
      // content:
      // sidebar: ReducerAndMakeUpdaterReadme,
    },
  });
