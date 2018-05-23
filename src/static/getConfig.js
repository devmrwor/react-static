/* eslint-disable import/no-dynamic-require */

import React from 'react'
import path from 'path'
import chokidar from 'chokidar'

import { pathJoin } from '../utils/shared'
import { reloadRoutes } from './webpack'
import getDirname from '../utils/getDirname'

const REGEX_TO_CUT_TO_ROOT = /(\..+?)\/.*/g
const REGEX_TO_REMOVE_TRAILING_SLASH = /^\/{0,}/g
const REGEX_TO_REMOVE_LEADING_SLASH = /\/{0,}$/g

const DEFAULT_NAME_FOR_STATIC_CONFIG_FILE = 'static.config.js'
// the default static.config.js location
const DEFAULT_PATH_FOR_STATIC_CONFIG = path.resolve(
  path.join(process.cwd(), DEFAULT_NAME_FOR_STATIC_CONFIG_FILE)
)
const DEFAULT_ROUTES = [{ path: '/' }]
const DEFAULT_ENTRY = 'index.js'
const PATH_404 = '404'

export const cutPathToRoot = (string = '') => string.replace(REGEX_TO_CUT_TO_ROOT, '$1')

export const trimLeadingAndTrailingSlashes = (string = '') =>
  string.replace(REGEX_TO_REMOVE_TRAILING_SLASH, '').replace(REGEX_TO_REMOVE_LEADING_SLASH, '')

export const throwErrorIfRouteIsMissingPath = route => {
  const { path, is404 = false } = route

  if (!is404 && !path) {
    throw new Error(`No path defined for route: ${JSON.stringify(route)}`)
  }
}

const consoleWarningForRouteWithoutNoIndex = route =>
  route.noIndex &&
  console.warn(`=> Warning: Route ${route.path} is using 'noIndex'. Did you mean 'noindex'?`)

export const createNormalizedRoute = (route, parent = {}, config = {}) => {
  const { children, ...routeWithOutChildren } = route
  const { path: parentPath = '/' } = parent
  const { tree: keepRouteChildren = false } = config
  const { is404 = false } = route

  throwErrorIfRouteIsMissingPath(route)

  const originalRoutePath = is404 ? PATH_404 : pathJoin(route.path)
  const routePath = is404 ? PATH_404 : pathJoin(parentPath, route.path)

  consoleWarningForRouteWithoutNoIndex(route)

  const normalizedRoute = {
    ...(keepRouteChildren ? route : routeWithOutChildren),
    path: routePath,
    originalPath: originalRoutePath,
    noindex: route.noindex || parent.noindex || route.noIndex,
    hasGetProps: !!route.getData,
  }

  return normalizedRoute
}

export const consoleWarningForMutlipleRoutesWithTheSamePath = routes => {
  routes.forEach(route => {
    const found = routes.filter(r => r.path === route.path)
    if (found.length > 1) {
      console.warn('More than one route is defined for path:', route.path)
    }
  })
}

const recurseCreateNormalizedRoute = (routes = [], parent, config) => {
  if (config.tree) {
    return routes
      .map(route => {
        const normalizedRoute = createNormalizedRoute(route, parent, config)
        normalizedRoute.children = recurseCreateNormalizedRoute(
          normalizedRoute.children,
          normalizedRoute,
          config
        )
        return normalizedRoute
      })
      .filter(d => d !== null)
  }

  return routes.reduce((memo = [], route) => {
    const normalizedRoute = createNormalizedRoute(route, parent, config)
    const routeExists = memo.find(({ path }) => path === normalizedRoute.path)

    return [
      ...memo,
      ...recurseCreateNormalizedRoute(route.children, normalizedRoute, config),
      ...(routeExists ? [] : [normalizedRoute]),
    ]
  }, [])
}

// Normalize routes with parents, full paths, context, etc.
export const normalizeRoutes = (routes, config = {}) => {
  const { disableDuplicateRoutesWarning, force404 = true } = config
  const normalizedRoutes = recurseCreateNormalizedRoute(routes, {}, config)

  if (!disableDuplicateRoutesWarning) {
    consoleWarningForMutlipleRoutesWithTheSamePath(normalizedRoutes)
  }

  if (force404 && !normalizedRoutes.find(r => r.is404)) {
    normalizedRoutes.push(
      createNormalizedRoute({
        is404: true,
        path: PATH_404,
      }),
      config
    )
  }

  return normalizedRoutes
}

// At least ensure the index page is defined for export
export const makeGetRoutes = config => async (...args) => {
  const { getRoutes = async () => DEFAULT_ROUTES } = config
  const routes = await getRoutes(...args)
  return normalizeRoutes(routes, config)
}

export const buildConfigation = (config = {}) => {
  // path defaults
  config.paths = {
    root: path.resolve(process.cwd()),
    src: 'src',
    dist: 'dist',
    devDist: 'tmp/dev-server',
    public: 'public',
    ...(config.paths || {}),
  }

  // Use the root to resolve all other relative paths
  const resolvePath = relativePath => path.resolve(config.paths.root, relativePath)

  // Resolve all paths
  const distPath =
    process.env.REACT_STATIC_ENV === 'development'
      ? resolvePath(config.paths.devDist || config.paths.dist)
      : resolvePath(config.paths.dist)

  const paths = {
    ROOT: config.paths.root,
    LOCAL_NODE_MODULES: path.resolve(getDirname(), '../../node_modules'),
    SRC: resolvePath(config.paths.src),
    DIST: distPath,
    PUBLIC: resolvePath(config.paths.public),
    NODE_MODULES: resolvePath('node_modules'),
    PACKAGE: resolvePath('package.json'),
    HTML_TEMPLATE: path.join(distPath, 'index.html'),
    STATIC_DATA: path.join(distPath, 'staticData'),
  }

  // Defaults
  const finalConfig = {
    // Defaults
    entry: path.join(paths.SRC, DEFAULT_ENTRY),
    getSiteData: () => ({}),
    renderToHtml: (render, Comp) => render(<Comp />),
    prefetchRate: 3,
    disableRouteInfoWarning: false,
    disableRoutePrefixing: false,
    outputFileRate: 10,
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
    getRoutes: makeGetRoutes(config),
  }

  // Set env variables to be used client side
  process.env.REACT_STATIC_PREFETCH_RATE = finalConfig.prefetchRate
  process.env.REACT_STATIC_DISABLE_ROUTE_INFO_WARNING = finalConfig.disableRouteInfoWarning
  process.env.REACT_STATIC_DISABLE_ROUTE_PREFIXING = finalConfig.disableRoutePrefixing

  return finalConfig
}

const buildConfigFromPath = configPath => {
  const filename = path.resolve(configPath)
  delete require.cache[filename]
  try {
    const config = require(configPath).default
    return buildConfigation(config)
  } catch (err) {
    console.error(err)
    return {}
  }
}

const fromFile = (configPath = DEFAULT_PATH_FOR_STATIC_CONFIG, watch) => {
  const config = buildConfigFromPath(configPath)

  if (watch) {
    chokidar.watch(configPath).on('all', () => {
      Object.assign(config, buildConfigFromPath(configPath))
      reloadRoutes()
    })
  }

  return config
}

// Retrieves the static.config.js from the current project directory
export default function getConfig (customConfig, { watch } = {}) {
  if (typeof customConfig === 'object') {
    // return a custom config obj
    return buildConfigation(customConfig)
  }

  // return a custom config file location
  // defaults to constant paath for static config
  return fromFile(customConfig, watch)
}
