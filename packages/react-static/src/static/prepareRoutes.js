import path from 'path'
import chalk from 'chalk'

import getRoutes from './getRoutes'
import buildXML from './buildXML'
import { makeHookReducer, time, timeEnd } from '../utils'

export { buildXML }

export default (async function prepareRoutes(config, opts = {}, cb = d => d) {
  const beforePrepareRoutes = makeHookReducer(
    config.plugins,
    'beforePrepareRoutes'
  )
  config = await beforePrepareRoutes(config)

  if (!opts.silent) console.log('=> Building Routes...')
  // set the static routes
  process.env.REACT_STATIC_ROUTES_PATH = path.join(
    config.paths.BUILD_ARTIFACTS,
    'react-static-templates.js'
  )

  if (!opts.silent) time(chalk.green('=> [\u2713] Routes Built'))
  await getRoutes(
    {
      config,
      opts,
    },
    async routes => {
      if (!opts.silent) timeEnd(chalk.green('=> [\u2713] Routes Built'))
      config.routes = routes
      return cb(config)
    }
  )

  const afterPrepareRoutes = makeHookReducer(
    config.plugins,
    'afterPrepareRoutes'
  )
  config = await afterPrepareRoutes(config)
  return config
})
