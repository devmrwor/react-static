# 4.3.1
#### Fixes & Optimizations
- Fixed a bug where component names with numbers would not render propertly. (Thanks [@muloka](https://github.com/muloka)!)

# 4.3.0
#### Features
- `config.paths.devDist` can now be set to specify a different scratch output directory when in development mode.

#### Fixes & Optimizations
- `react-static-routes` imports are now relative, thus avoiding absolute path madness... hopefully? :)

# 4.2.0
#### Features
- Added Probot to the github repo! Hooray!
- Better yarn/npm colors in cli. [@cgmx](https://github.com/cgmx)
- Router now uses `componentDidCatch` to gracefully display runtime errors for you.

#### Fixes & Optimizations
- `react-static-routes` now uses dynamic template imports. [@EmilTholin](https://github.com/emiltholin)
- Helmet meta tags are more reliably extracted. [@EmilTholin](https://github.com/emiltholin)
- Config server is no longer served separately, but piggybacks on webpack dev server. [@rileylnapier](https://github.com/rileylnapier)

# 4.1.0
#### Features
- Added `config.paths`, which can now be used to customize `dist` folder location and other file locations used by react-static
- Added `onStart` hook. Fires after the first successful dev build when running `react-static start`
- Added `onBuild` hook. Fires after a successful production build when running `react-static build`
- Added `config.devServer`, which can be used to customize the configuration for the webpack-dev-server used in development. (Thanks [@rywils21](https://github.com/rywils21)!)
- Added TypeScript typings for React-Static core exports (Thanks [@D1no](https://github.com/D1no)!)
- Allow customization of dev server PORT and HOST via those environment variables. (Thanks [@rywils21](https://github.com/rywils21)!)
- `config.getRoutes` is no longer required and will default to exporting a single root path.
- Webpack configurations can now be exported and used externally. (Thanks [@crubier](https://github.com/crubier)!)
- `<Router>` component now supports a `type` prop that can be: `browser`, `hash`, or `memory`, which defines which type of `history` object to create and use internally. Useful for non-web environments or situations where your app will be accessed in a filesystem or nested domain as opposed to a web server.
- Added Redux example (Thanks [@crubier](https://github.com/crubier)!)
- Added Apollo GraphQL example (Thanks [@crubier](https://github.com/crubier)!)
- Added Redux + Apollo example (Thanks [@crubier](https://github.com/crubier)!)
- Added Typscript example (Thanks [@D1no](https://github.com/D1no)!)

#### Fixes & Optimization
- The `Document`'s `<title>` tag can now be used as a fallback to any `<title>` tag produced via the `<Head>` component. (Thanks [@EmilTholin](https://github.com/EmilTholin)!)
- Fixed a bug where not defining a 404 component resulted in an error during production build. (Thanks [@mplis](https://github.com/mplis)!)
- Fixed a bug where the webpack dev server would rebuild the app multiple times in a row when started up for the first time. (Thanks [@cgmx](https://github.com/cgmx)!)

# 4.0.0
#### Breaking Changes
- The `webpack` function in `static.config.js` has a new function signature.
  - Each function is now **not** required to return a new config object. If a falsey value is returned, the transformation will be ignored, and the next transformation will carry on as normal. Even so, avoid mutating the config object at all costs ;)
  - A new argument is now available in the `args` parameter called `defaultLoaders`:
  ```javascript
    webpack: (
      config, {
        defaultLoaders: {
          jsLoader,
          cssLoader,
          fileLoader
        }
      }
    ) => {...}
  ```
  These loaders are here for convenience. Please read the documentation for more information.

#### Features
- A dynamic code-splitting example and typescript example are now available! Huzzah!

#### Fixes & Optimizations
- Webpack files are now hashed for better cache invalidation. It's about time right?!


# 3.0.0
#### Breaking Changes
- Your `index.js` file must now export your app in NON-JSX form, eg. `export default App`, not `<App />`. With this change, builds can be faster, leaner, and have more control over the build pipeline.
- The optional `Html` component in `static.config.js` was renamed to `Document`.
- The `preRenderMeta` and `postRenderMeta` hooks in `static.config.js` have been deprecated in favor of the new `renderToHtml` hook. This is a very important change, so please check the readme if you are using these hooks!
- The new `renderToHtml` hook now uses a **mutable** meta object. This object is passed as a prop to the base `Document` component as `renderMeta` now, instead of the previous `staticMeta`.

#### Features
- New `PrefetchWhenSeen` component allows for prefetching when component becomes visible in the viewport.

#### Fixes & Optimizations
- Exporting is now up to 2x faster after switching from a dual pass to a single pass render strategy.
- Fixed a very elusive and angering bug where imported node_modules were not being shared between the node context and the node webpack build of the app used for exporting.

# 2.0.0
#### Breaking Changes
- The `webpack` function in `static.config.js` has a new function signature.
  - The new value can be an array of functions or a single function.
  - Each function passed will receive the previous resulting (or built-in) webpack config, and expect a modified or new config to be returned. See [Webpack Config and Plugins](#webpack-config-and-plugins)

#### Features
Now that the `webpack` callback accepts an array of transformer functions, the concept of plugins has been introduced. These transformer functions are applied in order from top to bottom and have total control over the webpack config. For more information see [Webpack Config and Plugins](#webpack-config-and-plugins)
```
webpack: [
  withCssLoader,
  withFileLoader
]
```

#### Fixes & Optimizations
All route exporting is now done via a node bundle that is packaged with webpack. This should dramatically increase reliability in customization and cross-platform usability.
