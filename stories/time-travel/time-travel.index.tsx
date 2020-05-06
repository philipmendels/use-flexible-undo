import React from 'react';
import { storiesOf } from '@storybook/react';

import { ActionHistory } from './action-history';
import ActionHistoryReadme from './action-history.md';
import { ActionHistory1 } from './action-history-1';
import ActionHistory1Readme from './action-history-1.md';
import { ActionHistory2 } from './action-history-2';
import ActionHistory2Readme from './action-history-2.md';
import { ActionHistory3 } from './action-history-3';
import ActionHistory3Readme from './action-history-3.md';

storiesOf('useFlexibleUndo/time travel', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add('action history 1', () => <ActionHistory1 />, {
    readme: {
      sidebar: ActionHistory1Readme,
    },
  })
  .add('action history 2', () => <ActionHistory />, {
    readme: {
      sidebar: ActionHistoryReadme,
    },
  })
  .add('action history 3', () => <ActionHistory2 />, {
    readme: {
      sidebar: ActionHistory2Readme,
    },
  })
  .add('action history 4', () => <ActionHistory3 />, {
    readme: {
      sidebar: ActionHistory3Readme,
    },
  });
