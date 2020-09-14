import React from 'react';
import { storiesOf } from '@storybook/react';

import { OptionsExample } from './options';
import OptionsIntro from './options.intro.md';
import OptionsReadme from './options.md';

import { TimeTravelByIndexExample } from './time-travel-by-index';
import TimeTravelByIndexIntro from './time-travel-by-index.intro.md';
import TimeTravelByIndexReadme from './time-travel-by-index.md';

import { TimeTravelByIdExample } from './time-travel-by-id';
import TimeTravelByIdIntro from './time-travel-by-id.intro.md';
import TimeTravelByIdReadme from './time-travel-by-id.md';

import { SwitchToBranchExample } from './switch-to-branch';
import SwitchToBranchReadme from './switch-to-branch.md';
import SwitchToBranchIntro from './switch-to-branch.intro.md';

import { DescribeActionsSwitch } from './describe-actions-switch';
import { DescribeActionsMap } from './describe-actions-map';
import { DescriptionInPayloadExample } from './description-in-payload';

storiesOf('useUndoableEffects/time travel', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add('option to clear the future', () => <OptionsExample />, {
    readme: {
      content: OptionsIntro,
      sidebar: OptionsReadme,
    },
  })
  .add('time travel by index', () => <TimeTravelByIndexExample />, {
    readme: {
      content: TimeTravelByIndexIntro,
      sidebar: TimeTravelByIndexReadme,
    },
  })
  .add('time travel by id', () => <TimeTravelByIdExample />, {
    readme: {
      content: TimeTravelByIdIntro,
      sidebar: TimeTravelByIdReadme,
    },
  })
  .add('switch branch', () => <SwitchToBranchExample />, {
    readme: {
      content: SwitchToBranchIntro,
      sidebar: SwitchToBranchReadme,
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
  });
