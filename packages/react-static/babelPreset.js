const r = require.resolve

module.exports = (api, options = {}) => {
  const { NODE_ENV, BABEL_ENV } = process.env

  const PRODUCTION = (BABEL_ENV || NODE_ENV) === 'production'

  return {
    ...(options.external
      ? {
          sourceType: 'unambiguous',
        }
      : {}),
    presets: [
      !options.external
        ? [
            r('@babel/preset-env'),
            {
              targets: {
                browsers: PRODUCTION
                  ? ['last 4 versions', 'safari >= 7', 'ie >= 9']
                  : ['last 2 versions', 'not ie <= 11', 'not android 4.4.3'],
              },
              useBuiltIns: 'entry',
              modules: options.modules,
            },
          ]
        : [
            r('@babel/preset-env'),
            {
              targets: {
                ie: 9,
              },
              ignoreBrowserslistConfig: true,
              useBuiltIns: false,
              modules: false,
            },
          ],
      [r('@babel/preset-react'), { development: !PRODUCTION }],
    ].filter(Boolean),
    plugins: (!options.external
      ? [
          r('babel-plugin-macros'),
          PRODUCTION
            ? r('babel-plugin-universal-import')
            : r('react-hot-loader/babel'),
          r('@babel/plugin-transform-destructuring'),
          [
            r('@babel/plugin-transform-runtime'),
            {
              helpers: !!options.helpers,
              regenerator: true,
            },
          ],
          PRODUCTION && r('babel-plugin-transform-react-remove-prop-types'),
          r('@babel/plugin-syntax-dynamic-import'),
          r('@babel/plugin-proposal-class-properties'),
          r('@babel/plugin-proposal-optional-chaining'),
          r('@babel/plugin-proposal-export-default-from'),
        ]
      : [
          [
            r('@babel/plugin-transform-runtime'),
            {
              corejs: false,
              helpers: !!options.helpers,
              regenerator: true,
              useESModules: true,
            },
          ],
          r('@babel/plugin-syntax-dynamic-import'),
        ]
    ).filter(Boolean),
  }
}
