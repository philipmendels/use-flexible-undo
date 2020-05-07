import React from 'react';
import { storiesOf } from '@storybook/react';

import { CallbacksExample } from './callbacks';
import CallbacksReadme from './callbacks.md';
import { CallbacksLatestExample } from './callbacks-latest';
import CallbacksLatestReadme from './callbacks-latest.md';

storiesOf('useFlexibleUndo/callbacks', module)
  //@ts-ignore
  .addParameters({ options: { theme: {} } })
  .add('callbacks', () => <CallbacksExample />, {
    readme: {
      sidebar: CallbacksReadme,
    },
  })
  .add('callbacks - latest', () => <CallbacksLatestExample />, {
    readme: {
      sidebar: CallbacksLatestReadme,
    },
  });
