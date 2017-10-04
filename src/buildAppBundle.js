import webpack from 'webpack'
import chalk from 'chalk'
import WebpackConfigurator from 'webpack-configurator'
//
import webpackConfigProd from './webpack.config.prod'
import { getConfig } from './static'

const config = getConfig()
const webpackConfig = new WebpackConfigurator()

webpackConfig.merge(webpackConfigProd)
if (config.webpack) {
  config.webpack(webpackConfig, { dev: false })
}
const finalWebpackConfig = webpackConfig.resolve()

const compiler = webpack(finalWebpackConfig)

export default () =>
  new Promise((resolve, reject) =>
    compiler.run((err, stats) => {
      if (err) {
        console.log(chalk.red(err.stack || err))
        if (err.details) {
          console.log(chalk.red(err.details))
        }
        return reject(err)
      }

      stats.toJson('verbose')

      const buildErrors = stats.hasErrors()
      const buildWarnings = stats.hasWarnings()

      if (buildErrors || buildWarnings) {
        console.log(
          stats.toString({
            context: webpackConfig.context,
            performance: false,
            hash: false,
            timings: true,
            entrypoints: false,
            chunkOrigins: false,
            chunkModules: false,
            colors: true,
          }),
        )
        console.log(
          chalk.red.bold(
            `
    ERRORS DURING COMPILATION! :(
=> Fix them and try again!`,
          ),
        )
      }

      resolve()
    }),
  )
