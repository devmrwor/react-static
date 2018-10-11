import React from 'react'
import createBrowserHistory from 'history/createBrowserHistory'
import createMemoryHistory from 'history/createMemoryHistory'
import createHashHistory from 'history/createHashHistory'
import { Router as ReactRouter, StaticRouter } from 'react-router-dom'
//
import { cleanPath } from '../../utils/browser'
import {
  getRouteInfo,
  propsByHash,
  needsPrefetch,
  prefetch,
  setLoading,
  registerTemplateIDForPath,
} from '../'
import { withExportContext } from './ExportContext'
import RouterScroller from './RouterScroller'
import DevSpinner from './DevSpinner'
import ErrorWrapper from './ErrorWrapper'

const Router = withExportContext(
  class Router extends React.Component {
    static defaultProps = {
      type: 'browser',
      autoScrollToTop: true,
      autoScrollToHash: true,
      scrollToTopDuration: 0,
      scrollToHashDuration: 800,
      scrollToHashOffset: 0,
      showErrorsInProduction: false,
    }
    state = {
      ready: false,
    }
    constructor(props) {
      super()

      // In SRR and production, synchronously register the templateID for the
      // initial path
      let { routeInfo } = props.exportContext
      let path = cleanPath(props.exportContext.staticURL)

      if (typeof window !== 'undefined') {
        routeInfo = window.__routeInfo
        const href = decodeURIComponent(window.location.href)
        path = cleanPath(href)
      }

      if (routeInfo) {
        registerTemplateIDForPath(path, routeInfo.templateID)
      }
    }
    componentDidMount() {
      this.bootstrapRouteInfo()
    }
    bootstrapRouteInfo = () =>
      (async () => {
        if (typeof window !== 'undefined') {
          // Get the entry path from location
          const href = decodeURIComponent(window.location.href)
          const path = cleanPath(href)

          // Injest and cache the embedded routeInfo in the page if possible
          if (window.__routeInfo && window.__routeInfo.path === path) {
            const { allProps } = window.__routeInfo
            Object.keys(window.__routeInfo.sharedPropsHashes).forEach(
              propKey => {
                propsByHash[window.__routeInfo.sharedPropsHashes[propKey]] =
                  allProps[propKey]
              }
            )
          }

          // In dev mode, request the templateID and ready the router
          if (process.env.REACT_STATIC_ENV === 'development') {
            try {
              const routeInfo = await getRouteInfo(path, { priority: true })
              if (routeInfo) {
                registerTemplateIDForPath(path, routeInfo.templateID)
              }
            } finally {
              this.setState({ ready: true })
            }
          }
        }
      })()
    patchHistoryNavigation = resolvedHistory => {
      // Only patch navigation once
      if (this.patchedNavigation) {
        return
      }
      // Here, we patch the push and replace methods on history so we can
      // intercept them.
      ;['push', 'replace'].forEach(method => {
        // Hold on to the original method, we will need it.
        const originalMethod = resolvedHistory[method]
        // Replace it with our own patched version
        resolvedHistory[method] = async (...args) => {
          // Clean the path first
          const path = cleanPath(
            typeof args[0] === 'string' ? args[0] : args[0].path
          )
          // Notify a soft loading state
          setLoading(1)
          // Determine as quickly as possible if we need to fetch data for this route
          const shouldPrefetch = await needsPrefetch(path, { priority: true })

          // If we need to load...
          if (shouldPrefetch) {
            // Notify with a hard loading state
            setLoading(2)
            // Prefetch any data or templates needed with a high priority
            await prefetch(path, {
              priority: true,
            })
          }

          // Notify we're done loading
          setLoading(0)

          // Apply the original method and arguments as if nothing happened
          originalMethod.apply(resolvedHistory, args)
        }
      })

      // Only patch navigation once :)
      this.patchedNavigation = true
    }
    render() {
      const {
        history,
        type,
        children,
        autoScrollToTop,
        autoScrollToHash,
        scrollToTopDuration,
        scrollToHashDuration,
        scrollToHashOffset,
        showErrorsInProduction,
        ...rest
      } = this.props
      const { staticURL } = this.props.exportContext
      const routerContext = staticURL ? {} : undefined
      const disableRoutePrefixing =
        process.env.REACT_STATIC_DISABLE_ROUTE_PREFIXING === 'true'

      const { ready } = this.state

      let ResolvedRouter
      let resolvedHistory

      // If statically rendering, use the static router
      if (staticURL) {
        ResolvedRouter = StaticRouter
        resolvedHistory = undefined
      } else {
        ResolvedRouter = ReactRouter
        resolvedHistory = history || global.__reactStaticRouterHistory
        if (!resolvedHistory) {
          if (type === 'memory') {
            resolvedHistory = createMemoryHistory()
          } else if (type === 'hash') {
            resolvedHistory = createHashHistory()
          } else {
            const options = disableRoutePrefixing
              ? {}
              : { basename: process.env.REACT_STATIC_BASE_PATH }
            resolvedHistory = createBrowserHistory(options)
          }
        }
        global.__reactStaticRouterHistory = resolvedHistory
        this.patchHistoryNavigation(resolvedHistory)
      }

      if (process.env.REACT_STATIC_ENV === 'development' && !ready) {
        return <DevSpinner />
      }

      return (
        <ErrorWrapper showErrorsInProduction={showErrorsInProduction}>
          <ResolvedRouter
            history={resolvedHistory}
            location={staticURL}
            context={routerContext}
            basename={
              disableRoutePrefixing ? '' : process.env.REACT_STATIC_BASE_PATH
            }
            {...rest}
          >
            <RouterScroller
              {...{
                autoScrollToTop,
                autoScrollToHash,
                scrollToTopDuration,
                scrollToHashDuration,
                scrollToHashOffset,
              }}
            >
              {children}
            </RouterScroller>
          </ResolvedRouter>
        </ErrorWrapper>
      )
    }
  }
)

export default Router
