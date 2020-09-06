import 'storybook-readme/register';
import '@storybook/addon-actions/register';
import '@storybook/addon-links/register';
import { addons } from '@storybook/addons';

import { create } from '@storybook/theming/create';

addons.setConfig({
  panelPosition: 'right',
  selectedPanel: 'Readme',
  theme: create({
    base: 'light',
    brandTitle: 'use-flexible-undo',
    brandUrl: 'https://github.com/philipmendels/use-flexible-undo',
  }),
});
