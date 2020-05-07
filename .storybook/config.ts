import { addDecorator, configure } from '@storybook/react';
import { addReadme } from 'storybook-readme';
import '@storybook/addon-console';
addDecorator(addReadme);
// automatically import all files ending in *.stories.js
// configure(require.context('../stories', true, /\.stories\.(js|ts)x?$/), module);
function loadStories() {
  require('../stories/index.stories.tsx');
}

configure(loadStories, module);
