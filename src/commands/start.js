import chalk from 'chalk'
import fs from 'fs-extra'
//
import { DIST } from '../paths'
import { prepareRoutes } from '../static'
import { DefaultDocument } from '../RootComponents'
import { startDevServer } from '../webpack'
import {
  getConfig,
  copyPublicFolder,
  createIndexFilePlaceholder,
} from '../utils'
import { startConfigServer } from '../configServer'
//

export default async () => {
  try {
    // Get the config
    const config = getConfig()

    // Clean the dist folder
    await fs.remove(DIST)

    // Get the site props
    const siteProps = await config.getSiteProps({ dev: true })

    // Resolve the base HTML template
    const Component = config.Document || DefaultDocument

    // Render an index.html placeholder
    await createIndexFilePlaceholder({
      Component,
      siteProps,
    })

    // Copy the public directory over
    console.log('')
    console.log('=> Copying public directory...')
    console.time(chalk.green('=> [\u2713] Public directory copied'))
    copyPublicFolder(DIST)
    console.timeEnd(chalk.green('=> [\u2713] Public directory copied'))

    // Build the dynamic routes file (react-static-routes)
    console.log('=> Building Routes...')
    console.time(chalk.green('=> [\u2713] Routes Built'))
    config.routes = await config.getRoutes({ dev: true })
    await prepareRoutes(config.routes)
    await startConfigServer()
    console.timeEnd(chalk.green('=> [\u2713] Routes Built'))

    // Build the JS bundle
    await startDevServer({ config })
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}
