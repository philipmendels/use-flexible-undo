import React from 'react';
import { storiesOf } from '@storybook/react';
import { TimeTravelByIdExample } from './time-travel-by-id';
import { TimeTravelByIndexExample } from './time-travel-by-index';
import { SwitchToBranchExample } from './switch-to-branch';

import { DescribeActionsSwitch } from './describe-actions-switch';
import { DescribeActionsMap } from './describe-actions-map';
import { HistoryChangeExample } from './history-change';
import { DescriptionInPayloadExample } from './description-in-payload';

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
  })
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
  .add('description-in-payload', () => <DescriptionInPayloadExample />, {
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
  });
