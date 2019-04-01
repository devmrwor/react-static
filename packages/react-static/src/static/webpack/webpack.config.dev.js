import webpack from 'webpack'
import resolveFrom from 'resolve-from'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import ExtractCssChunks from 'extract-css-chunks-webpack-plugin'
import path from 'path'

import rules from './rules'

export default function({ config }) {
  const { ROOT, DIST, NODE_MODULES, SRC, HTML_TEMPLATE } = config.paths

  process.env.REACT_STATIC_BASE_PATH = config.basePath
  process.env.REACT_STATIC_PUBLIC_PATH = config.publicPath
  process.env.REACT_STATIC_ASSETS_PATH = config.assetsPath

  return {
    mode: 'development',
    optimization: {
      noEmitOnErrors: true,
      concatenateModules: true,
    },
    context: path.resolve(__dirname, '../../../node_modules'),
    entry: [
      `webpack-dev-server/client?${config.devServer.host}:${
        config.devServer.port
      }`,
      'webpack/hot/only-dev-server',
      ...(config.disableRuntime
        ? []
        : [
            require.resolve('../../bootstrapPlugins'),
            require.resolve('../../bootstrapTemplates'),
          ]),
      path.resolve(ROOT, config.entry),
    ].filter(Boolean),
    output: {
      filename: '[name].js', // never hash dev code
      chunkFilename: 'templates/[name].js',
      path: DIST,
      publicPath: process.env.REACT_STATIC_ASSETS_PATH || '/',
    },
    module: {
      rules: rules({ config, stage: 'dev' }),
      strictExportPresence: true,
    },
    resolve: {
      modules: [
        NODE_MODULES,
        SRC,
        DIST,
        ...[NODE_MODULES, SRC, DIST].map(d => path.relative(__dirname, d)),
        'node_modules',
      ],
      extensions: ['.wasm', '.mjs', '.js', '.json', '.jsx'],
      alias: {
        react: resolveFrom(config.paths.NODE_MODULES, 'react'),
        'react-dom': resolveFrom(__dirname, '@hot-loader/react-dom'),
      },
    },
    plugins: [
      new webpack.EnvironmentPlugin(process.env),
      new HtmlWebpackPlugin({
        inject: true,
        template: `!!raw-loader!${HTML_TEMPLATE}`,
      }),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      new CaseSensitivePathsPlugin(),
      new ExtractCssChunks({ hot: true }),
      // new WebpackDashboard(),
    ],
    devtool: 'cheap-module-source-map',
  }
}
