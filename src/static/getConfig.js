/* eslint-disable import/no-dynamic-require */

import React from 'react'
import nodePath from 'path'
import chokidar from 'chokidar'
import resolveFrom from 'resolve-from'

import getDirname from '../utils/getDirname'

const REGEX_TO_CUT_TO_ROOT = /(\..+?)\/.*/g
const REGEX_TO_REMOVE_TRAILING_SLASH = /^\/{0,}/g
const REGEX_TO_REMOVE_LEADING_SLASH = /\/{0,}$/g

const DEFAULT_NAME_FOR_STATIC_CONFIG_FILE = 'static.config.js'
// the default static.config.js location
const DEFAULT_PATH_FOR_STATIC_CONFIG = nodePath.resolve(
  nodePath.join(process.cwd(), DEFAULT_NAME_FOR_STATIC_CONFIG_FILE)
)
const DEFAULT_ROUTES = [{ path: '/' }]
const DEFAULT_ENTRY = 'index.js'

export const cutPathToRoot = (string = '') => string.replace(REGEX_TO_CUT_TO_ROOT, '$1')

export const trimLeadingAndTrailingSlashes = (string = '') =>
  string.replace(REGEX_TO_REMOVE_TRAILING_SLASH, '').replace(REGEX_TO_REMOVE_LEADING_SLASH, '')

export const buildConfigation = (config = {}) => {
  // path defaults
  config.paths = {
    root: nodePath.resolve(process.cwd()),
    src: 'src',
    dist: 'dist',
    temp: 'tmp',
    devDist: 'tmp/dev-server',
    public: 'public',
    plugins: 'plugins', // TODO: document
    pages: 'src/pages', // TODO: document
    nodeModules: 'node_modules',
    ...(config.paths || {}),
  }

  // Use the root to resolve all other relative paths
  const resolvePath = relativePath => nodePath.resolve(config.paths.root, relativePath)

  // Resolve all paths
  const distPath =
    process.env.REACT_STATIC_ENV === 'development'
      ? resolvePath(config.paths.devDist || config.paths.dist)
      : resolvePath(config.paths.dist)

  const paths = {
    ROOT: config.paths.root,
    LOCAL_NODE_MODULES: nodePath.resolve(getDirname(), '../../node_modules'),
    SRC: resolvePath(config.paths.src),
    PAGES: resolvePath(config.paths.pages),
    PLUGINS: resolvePath(config.paths.plugins),
    TEMP: resolvePath(config.paths.temp),
    DIST: distPath,
    PUBLIC: resolvePath(config.paths.public),
    NODE_MODULES: resolvePath(config.paths.nodeModules),
    EXCLUDE_MODULES: config.paths.excludeResolvedModules || resolvePath(config.paths.nodeModules),
    PACKAGE: resolvePath('package.json'),
    HTML_TEMPLATE: nodePath.join(distPath, 'index.html'),
    STATIC_DATA: nodePath.join(distPath, 'staticData'),
  }

  // Defaults
  const finalConfig = {
    // Defaults
    entry: nodePath.join(paths.SRC, DEFAULT_ENTRY),
    getSiteData: () => ({}),
    renderToComponent: Comp => <Comp />,
    renderToHtml: (render, comp) => render(comp),
    prefetchRate: 3,
    maxThreads: Infinity,
    disableRouteInfoWarning: false,
    disableRoutePrefixing: false,
    outputFileRate: 100,
    extensions: ['.js', '.jsx'], // TODO: document
    getRoutes: async () => DEFAULT_ROUTES,
    plugins: [],
    // Config Overrides
    ...config,
    // Materialized Overrides
    paths,
    siteRoot: cutPathToRoot(config.siteRoot, '$1'),
    stagingSiteRoot: cutPathToRoot(config.stagingSiteRoot, '$1'),
    basePath: trimLeadingAndTrailingSlashes(config.basePath),
    stagingBasePath: trimLeadingAndTrailingSlashes(config.stagingBasePath),
    devBasePath: trimLeadingAndTrailingSlashes(config.devBasePath),
    extractCssChunks: config.extractCssChunks || false,
    inlineCss: config.inlineCss || false,
  }

  // Set env variables to be used client side
  process.env.REACT_STATIC_PREFETCH_RATE = finalConfig.prefetchRate
  process.env.REACT_STATIC_DISABLE_ROUTE_INFO_WARNING = finalConfig.disableRouteInfoWarning
  process.env.REACT_STATIC_DISABLE_ROUTE_PREFIXING = finalConfig.disableRoutePrefixing

  // Fetch plugins, if any
  finalConfig.plugins = finalConfig.plugins.map(plugin => {
    let resolver = plugin
    let options = {}
    if (Array.isArray(plugin)) {
      resolver = plugin[0]
      options = plugin[1] || {}
    }
    // Attempt a direct require for absolute paths
    try {
      plugin = require(resolver)
    } catch (err) {
      try {
        // Attempt a /plugins directory require
        plugin = require(nodePath.resolve(paths.PLUGINS, resolver))
      } catch (err) {
        // Attempt a root directory require (node_modules)
        plugin = require(resolveFrom(process.cwd(), resolver))
      }
    }

    return {
      resolver,
      options,
      ...plugin,
    }
  })

  return finalConfig
}

const buildConfigFromPath = configPath => {
  const filename = nodePath.resolve(configPath)
  delete require.cache[filename]
  try {
    const config = require(filename).default
    return buildConfigation(config)
  } catch (err) {
    console.error(err)
    return {}
  }
}

const fromFile = async (configPath = DEFAULT_PATH_FOR_STATIC_CONFIG, subscribe) => {
  const config = buildConfigFromPath(configPath)

  if (subscribe) {
    chokidar.watch(configPath).on('all', () => {
      subscribe(buildConfigFromPath(configPath))
    })
  }

  return config
}

// Retrieves the static.config.js from the current project directory
export default async function getConfig (customConfig, cb) {
  if (typeof customConfig === 'object') {
    // return a custom config obj
    const builtConfig = buildConfigation(customConfig)
    if (cb) {
      cb(builtConfig)
    }
    return builtConfig
  }

  // return a custom config file location
  // defaults to constant paath for static config
  return fromFile(customConfig, cb)
}
