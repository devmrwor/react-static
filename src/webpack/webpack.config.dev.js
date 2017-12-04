import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ScriptExtHtmlWebpackPlugin from 'script-ext-html-webpack-plugin'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import path from 'path'

import rules from './rules'

export default function ({ config }) {
  const { ROOT, DIST, NODE_MODULES, SRC, HTML_TEMPLATE } = config.paths
  return {
    context: path.resolve(__dirname, '../node_modules'),
    entry: [
      require.resolve('react-hot-loader/patch'),

      require.resolve('react-dev-utils/webpackHotDevClient'),
      // `${require.resolve('webpack-dev-server/client')}?/`,

      require.resolve('webpack/hot/only-dev-server'),
      path.resolve(ROOT, config.entry),
    ],
    output: {
      filename: 'app.[hash:8].js',
      path: DIST,
      publicPath: '/',
    },
    module: {
      rules: rules({ config, stage: 'dev' }),
    },
    resolve: {
      modules: [path.resolve(__dirname, '../node_modules'), NODE_MODULES, SRC, DIST],
      extensions: ['.js', '.json', '.jsx'],
    },
    plugins: [
      new webpack.EnvironmentPlugin(process.env),
      new HtmlWebpackPlugin({
        inject: true,
        template: `!!raw-loader!${HTML_TEMPLATE}`,
      }),
      new ScriptExtHtmlWebpackPlugin({
        defaultAttribute: 'async',
      }),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.NamedModulesPlugin(),
      new CaseSensitivePathsPlugin(),
    ],
    devtool: 'eval-source-map',
  }
}
