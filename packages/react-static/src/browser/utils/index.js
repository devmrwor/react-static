export { poolAll, createPool } from 'swimmer'

const REGEX_TO_CUT_TO_ROOT = /(\..+?)\/.*/g
const REGEX_TO_REMOVE_LEADING_SLASH = /^\/{1,}/g
const REGEX_TO_REMOVE_TRAILING_SLASH = /\/{1,}$/g
const REGEX_TO_REMOVE_DOUBLE_SLASH = /\/{2,}/g

export const cutPathToRoot = (string = '') =>
  string.replace(REGEX_TO_CUT_TO_ROOT, '$1')

export const trimLeadingSlashes = (string = '') =>
  string.replace(REGEX_TO_REMOVE_LEADING_SLASH, '')

export const trimTrailingSlashes = (string = '') =>
  string.replace(REGEX_TO_REMOVE_TRAILING_SLASH, '')

export const trimDoubleSlashes = (string = '') => {
  if (isAbsoluteUrl(string)) {
    const [scheme = '', path = ''] = string.split('://')

    return [scheme, path.replace(REGEX_TO_REMOVE_DOUBLE_SLASH, '/')].join('://')
  }

  return string.replace(REGEX_TO_REMOVE_DOUBLE_SLASH, '/')
}

export const cleanSlashes = (string, options = {}) => {
  if (!string) return ''

  const { leading = true, trailing = true, double = true } = options
  let cleanedString = string

  if (leading) {
    cleanedString = trimLeadingSlashes(cleanedString)
  }

  if (trailing) {
    cleanedString = trimTrailingSlashes(cleanedString)
  }

  if (double) {
    cleanedString = trimDoubleSlashes(cleanedString)
  }

  return cleanedString
}

export function pathJoin(...paths) {
  let newPath = paths.map(cleanSlashes).join('/')
  if (!newPath || newPath === '/') {
    return '/'
  }

  newPath = cleanSlashes(newPath)
  if (newPath.includes('?')) {
    newPath = newPath.substring(0, newPath.indexOf('?'))
  }
  return newPath
}

// This function is for extracting a routePath from a path or string
// RoutePaths do not have query params, basePaths, and should
// resemble the same string as passed in the static.config.js routes
export function getRoutePath(routePath) {
  // Detect falsey paths and the root path
  if (!routePath || routePath === '/') {
    return '/'
  }

  // Remove origin, hashes, and query params
  if (typeof document !== 'undefined') {
    routePath = routePath.replace(window.location.origin, '')
    routePath = routePath.replace(/#.*/, '')
    routePath = routePath.replace(/\?.*/, '')
  }

  // Be sure to remove the base path
  if (process.env.REACT_STATIC_BASE_PATH) {
    routePath = routePath.replace(
      new RegExp(`^\\/?${process.env.REACT_STATIC_BASE_PATH}\\/`),
      ''
    )
  }
  routePath = routePath || '/'
  return pathJoin(routePath)
}

export function unwrapArray(arg, defaultValue) {
  arg = Array.isArray(arg) ? arg[0] : arg
  if (!arg && defaultValue) {
    return defaultValue
  }
  return arg
}

export function isObject(a) {
  return !Array.isArray(a) && typeof a === 'object' && a !== null
}

export function deprecate(from, to) {
  console.warn(
    `React-Static deprecation notice: ${from} will be deprecated in favor of ${to} in the next major release.`
  )
}

export function removal(from) {
  console.warn(
    `React-Static removal notice: ${from} is no longer supported in this version of React-Static. Please refer to the CHANGELOG for details.`
  )
}

export function isAbsoluteUrl(url) {
  if (typeof url !== 'string') {
    return false
  }

  return /^[a-z][a-z0-9+.-]*:/.test(url)
}

export function makePathAbsolute(path) {
  if (typeof path !== 'string') {
    return '/'
  }

  if (isAbsoluteUrl(path)) {
    return path
  }

  return `/${trimLeadingSlashes(path)}`
}

export function makeHookReducer(plugins = [], hook, { sync } = {}) {
  const hooks = flattenHooks(plugins, hook)
  // Returns a runner that takes a value (and opts) and
  // reduces the value through each hook, returning the
  // final value
  // compare is a function which is used to compare
  // the prev and next value and decide which to use.
  // By default, if undefined is returned from a reducer, the prev value
  // is retained

  if (sync) {
    return (value, opts) =>
      hooks.reduce((prev, hook) => {
        const next = hook(prev, opts)
        return typeof next !== 'undefined' ? next : prev
      }, value)
  }

  return async (value, opts) => {
    value = await hooks.reduce(async (prevPromise, hook) => {
      const prev = await prevPromise
      const next = await hook(prev, opts)
      return typeof next !== 'undefined' ? next : prev
    }, Promise.resolve(value))
    return value
  }
}

export function makeHookMapper(plugins = [], hook) {
  const hooks = flattenHooks(plugins, hook)
  // Returns a runner that takes options and returns
  // a flat array of values mapped from each hook
  return async opts => {
    const vals = []
    await hooks.reduce(async (prevPromise, hook) => {
      await prevPromise
      const val = await hook(opts)
      vals.push(val)
    }, Promise.resolve())

    return vals.filter(d => typeof d !== 'undefined')
  }
}

function flattenHooks(plugins, hook) {
  // The flat hooks
  const hooks = []

  // Adds a plugin hook to the hook list
  const addToHooks = plugin => {
    // Add the hook
    hooks.push(plugin.hooks[hook])

    // Recurse into sub plugins if needs be
    if (plugin.plugins) {
      plugin.plugins.forEach(addToHooks)
    }
  }
  // Start with the config plugins
  plugins.forEach(addToHooks)

  // Filter out falsey entries
  return hooks.filter(Boolean)
}

export function isSSR() {
  return typeof document === 'undefined'
}

export function getBasePath() {
  return process.env.REACT_STATIC_DISABLE_ROUTE_PREFIXING === 'true'
    ? ''
    : process.env.REACT_STATIC_BASE_PATH
}

export function isPrefetchableRoute(path) {
  // when rendering static pages we dont need this et all
  if (isSSR()) {
    return false
  }

  // script links
  // eslint-disable-next-line
  if (path.indexOf('javascript:') === 0) {
    return false
  }

  const self = document.location
  let link

  try {
    link = new URL(path)
  } catch (e) {
    // if a path is not parsable by URL its a local relative path
    return true
  }

  // if the hostname/port/proto doesnt match its not a route link
  if (
    self.hostname !== link.hostname ||
    self.port !== link.port ||
    self.protocol !== link.protocol
  ) {
    return false
  }

  // deny all files with extension other than .html
  if (link.pathname.includes('.') && !link.pathname.includes('.html')) {
    return false
  }

  return true
}
