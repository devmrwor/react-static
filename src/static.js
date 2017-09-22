/* eslint-disable import/no-dynamic-require, react/no-danger, no-cond-assign */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { renderToStaticMarkup } from 'react-dom/server'
import fs from 'fs-extra'
import nodepath from 'path'
import Helmet from 'react-helmet'
//
import DefaultHtml from './DefaultHtml'
import { ROOT, DIST } from './paths'

const defaultEntry = './src/index'

const loadComponentForStatic = src => {
  // Require a copy of the component (important to do this in `IS_STATIC` environment variable)
  process.env.IS_STATIC = 'true'
  const Comp = require(nodepath.resolve(nodepath.join(ROOT, src))).default
  process.env.IS_STATIC = 'false'
  return Comp
}

export const getConfig = () =>
  require(nodepath.resolve(nodepath.join(process.cwd(), 'static.config.js'))).default

export const writeRoutesToStatic = async ({ config }) => {
  const HtmlTemplate = config.Html || DefaultHtml
  const Comp = loadComponentForStatic(config.entry || defaultEntry)

  return Promise.all(
    config.routes.map(async route => {
      // Fetch initialProps from each route
      const initialProps = route.getProps && (await route.getProps({ route, prod: true }))
      if (initialProps) {
        await fs.outputFile(
          nodepath.join(DIST, route.path, 'routeData.json'),
          JSON.stringify(initialProps || {}),
        )
      }

      const URL = route.path

      // Inject initialProps into static build
      class InitialPropsContext extends Component {
        static childContextTypes = {
          initialProps: PropTypes.object,
          URL: PropTypes.string,
        }
        getChildContext () {
          return {
            initialProps,
            URL,
          }
        }
        render () {
          return this.props.children
        }
      }

      const ContextualComp = <InitialPropsContext>{Comp}</InitialPropsContext>

      let staticMeta = {}
      if (config.preRenderMeta) {
        // Allow the user to perform custom rendering logic (important for styles and helmet)
        staticMeta = {
          ...staticMeta,
          ...(await config.preRenderMeta(ContextualComp)),
        }
      }

      const appHtml = renderToStaticMarkup(ContextualComp)

      // Extract head calls using Helmet
      const helmet = Helmet.renderStatic()
      const head = {
        htmlProps: helmet.htmlAttributes.toComponent(),
        bodyProps: helmet.bodyAttributes.toComponent(),
        base: helmet.base.toComponent(),
        link: helmet.link.toComponent(),
        meta: helmet.meta.toComponent(),
        noscript: helmet.noscript.toComponent(),
        script: helmet.script.toComponent(),
        style: helmet.style.toComponent(),
        title: helmet.title.toComponent(),
      }

      staticMeta.head = head

      if (config.postRenderMeta) {
        // Allow the user to perform custom rendering logic (important for styles and helmet)
        staticMeta = {
          ...staticMeta,
          ...(await config.postRenderMeta(appHtml)),
        }
      }

      const Html = ({ children, ...rest }) => (
        <html lang="en" {...head.htmlprops} {...rest}>
          {children}
        </html>
      )
      const Head = ({ children, ...rest }) => (
        <head {...rest}>
          {head.base}
          {head.link}
          {head.meta}
          {head.noscript}
          {head.script}
          {head.style}
          {head.title}
          {children}
        </head>
      )
      const Body = ({ children, ...rest }) => (
        <body {...head.bodyProps} {...rest}>
          {children}
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `window.__routeData = ${JSON.stringify({
                path: route.path,
                initialProps,
              })}`,
            }}
          />
          <script async src="/app.js" />
        </body>
      )

      const html = renderToStaticMarkup(
        <HtmlTemplate staticMeta={staticMeta} Html={Html} Head={Head} Body={Body}>
          <div id="root" dangerouslySetInnerHTML={{ __html: appHtml }} />
        </HtmlTemplate>,
      )

      const urls = getMatches(
        /(?:\(|"|')((?:(?:\/\/)|(?:\/))(?!\.)(?:[^(),'"\s](?:(?!\/\/|<|>|;|:|@|\s)[^"|'])*)(?:\.(?:jpg|png|gif))(?:.*?))(?:"|'|\)|\s)/gm,
        html,
      ).filter((d, index, self) => self.indexOf(d) === index)

      const htmlFilename = nodepath.join(DIST, route.path, 'index.html')
      const initialPropsFilename = nodepath.join(DIST, route.path, 'routeData.json')
      const writeHTML = fs.outputFile(htmlFilename, html)
      const writeJSON = fs.outputFile(
        initialPropsFilename,
        JSON.stringify({
          initialProps,
          preload: urls,
        }),
      )
      await Promise.all([writeHTML, writeJSON])
    }),
  )
}

function getMatches (regex, string, index) {
  index = index || 1
  const matches = []
  let match
  while ((match = regex.exec(string))) {
    matches.push(match[index])
  }
  return matches
}

// function createSiteMap (pages) {
//   const xml = generateXML({
//     hostname: Info.siteRoot,
//     urls: pages.map(page => ({
//       url: page.permalink,
//       changefreq: 600000,
//       priority: page.priority || 0.5,
//       lastmod: formatDate(page.sys.updatedAt),
//     })),
//   })
//   fs.writeFile('./sitemap.xml', xml, () => console.log('[\u2713] Sitemap Generated'))
// }
//
// function generateXML ({ urls, hostname }) {
//   let xml =
//     '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
//   for (let i in urls) {
//     xml += '<url>'
//     xml += `<loc>${hostname}${urls[i].url}</loc>`
//     xml += urls[i].lastmod ? `<lastmod>${urls[i].lastmod}</lastmod>` : ''
//     xml += `<changefreq>${urls[i].changefreq}</changefreq>`
//     xml += `<priority>${urls[i].priority}</priority>`
//     xml += '</url>'
//     i++
//   }
//   xml += '</urlset>'
//   return xml
// }
//
// function formatDate (date) {
//   const d = new Date(date)
//   let month = `${d.getMonth() + 1}`
//   let day = `${d.getDate()}`
//   const year = d.getFullYear()
//
//   if (month.length < 2) month = `0${month}`
//   if (day.length < 2) day = `0${day}`
//
//   return [year, month, day].join('-')
// }
