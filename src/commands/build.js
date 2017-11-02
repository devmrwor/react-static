import fs from 'fs-extra'
import chalk from 'chalk'
//
import { DIST } from '../paths'
import { exportRoutes, buildXMLandRSS, prepareRoutes } from '../static'
import { buildProductionBundles } from '../webpack'
import { getConfig, copyPublicFolder } from '../utils'

export default async () => {
  try {
    const config = getConfig()
    await fs.remove(DIST)

    console.log('')
    console.time('=> Site is ready for production!')

    console.log('=> Copying public directory...')
    console.time(chalk.green('=> [\u2713] Public directory copied'))
    copyPublicFolder(DIST)
    console.timeEnd(chalk.green('=> [\u2713] Public directory copied'))

    console.log('=> Building Routes...')
    console.time(chalk.green('=> [\u2713] Routes Built'))
    config.routes = await config.getRoutes({ dev: false })
    await prepareRoutes(config.routes)
    console.timeEnd(chalk.green('=> [\u2713] Routes Built'))

    // Build static pages and JSON
    console.log('=> Bundling App...')
    console.time(chalk.green('=> [\u2713] App Bundled'))
    await buildProductionBundles({ config })
    console.timeEnd(chalk.green('=> [\u2713] App Bundled'))

    if (config.bundleAnalyzer) {
      await new Promise(() => {})
    }

    console.log('=> Exporting Routes...')
    console.time(chalk.green('=> [\u2713] Routes Exported'))
    await exportRoutes({ config })
    await buildXMLandRSS({ config })
    console.timeEnd(chalk.green('=> [\u2713] Routes Exported'))

    console.timeEnd('=> Site is ready for production!')
    process.exit(0)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}
