import React from 'react';
import { storiesOf } from '@storybook/react';

import { CallbacksExample } from './callbacks';
import CallbacksReadme from './callbacks.md';
import { CallbacksLatestExample } from './callbacks-latest';
import CallbacksLatestReadme from './callbacks-latest.md';
import { CallbacksWithMetaExample } from './callbacks-with-meta';
import CallbacksWithMetaReadme from './callbacks-with-meta.md';

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
  })
  .add('callbacks with meta-actions', () => <CallbacksWithMetaExample />, {
    readme: {
      sidebar: CallbacksWithMetaReadme,
    },
  });
