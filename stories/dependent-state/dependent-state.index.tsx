import React from 'react';
import { storiesOf } from '@storybook/react';

import { DependentStateWrong } from './dependent-state-wrong';
import DependentStateWrongIntro from './dependent-state-wrong-intro.md';
import DependentStateWrongReadme from './dependent-state-wrong.md';
import { WaitForUpdateExample } from './dependent-state-wait';
import WaitForUpdateReadme from './dependent-state-wait.md';
import { DependentStateRight1Example } from './dependent-state-right-1';
import DependentStateRight1Intro from './dependent-state-right-1-intro.md';
import DependentStateRight1Readme from './dependent-state-right-1.md';
import { DependentStateRight2Example } from './dependent-state-right-2';
import DependentStateRight2Intro from './dependent-state-right-2-intro.md';
import DependentStateRight2Readme from './dependent-state-right-2.md';
import { DependentStateRight3Example } from './dependent-state-right-3';
import DependentStateRight3Readme from './dependent-state-right-3.md';
import { DependentStateRight4Example } from './dependent-state-right-4';
import DependentStateRight4Readme from './dependent-state-right-4.md';

storiesOf('useFlexibleUndo/dependent state', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add('dependent state: WRONG', () => <DependentStateWrong />, {
    readme: {
      content: DependentStateWrongIntro,
      sidebar: DependentStateWrongReadme,
    },
  })
  .add('dependent state: wait for update', () => <WaitForUpdateExample />, {
    readme: {
      // content: DependentStateWrongIntro,
      sidebar: WaitForUpdateReadme,
    },
  })
  .add('dependent state: RIGHT 1', () => <DependentStateRight1Example />, {
    readme: {
      content: DependentStateRight1Intro,
      sidebar: DependentStateRight1Readme,
    },
  })
  .add('dependent state: RIGHT 2', () => <DependentStateRight2Example />, {
    readme: {
      content: DependentStateRight2Intro,
      sidebar: DependentStateRight2Readme,
    },
  })
  .add('dependent state: RIGHT 3', () => <DependentStateRight3Example />, {
    readme: {
      sidebar: DependentStateRight3Readme,
    },
  })
  .add('dependent state: RIGHT 4', () => <DependentStateRight4Example />, {
    readme: {
      sidebar: DependentStateRight4Readme,
    },
  });
