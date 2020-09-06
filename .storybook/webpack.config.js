require('module-alias/register');
const npm_package = require('../package.json');
const path = require('path');
module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.tsx?$/,
    use: [
      {
        loader: require.resolve('ts-loader'),
        options: {
          reportFiles: ['stories/**/*.{ts|tsx}'],
          compilerOptions: { declaration: false },
        },
      },
    ],
  });
  config.resolve.extensions.push('.ts', '.tsx');
  config.resolve.alias = Object.assign(config.resolve.alias, {
    '@': path.resolve(__dirname, '..'),
  });
  config.resolve.alias = Object.assign(
    config.resolve.alias,
    npm_package._moduleAliases || {}
  );
  return config;
};
