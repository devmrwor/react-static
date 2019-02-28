# Plugins

React Static ships with a plugin API to extend React Static's functionality.

## Installing Plugins

#### Official Plugins via NPM
- CSS & Style Tooling
  - [react-static-plugin-emotion](/packages/react-static-plugin-emotion) - Adds SSR support for Emotion components.
  - [react-static-plugin-styled-components](/packages/react-static-plugin-styled-components) - Adds SSR support for Styled-Components
  - [react-static-plugin-sass](/packages/react-static-plugin-sass) - Adds SSR and general support for SASS
  - [react-static-plugin-less](/packages/react-static-plugin-less) - Adds SSR and general support for LESS
  - [react-static-plugin-jss](/packages/react-static-plugin-jss) - Adds SSR support for JSS
- React Alternatives
  - [react-static-plugin-preact](/packages/react-static-plugin-preact) - Adds preact support
- React Router
  - [react-static-plugin-react-router](/packages/react-static-plugin-react-router) - Adds react-router support
- Type checking
  - [react-static-plugin-typescript](https://www.npmjs.com/package/react-static-plugin-typescript) - Allows you to write your components in TypeScript
- Assets
  - [react-static-plugin-favicons](https://www.npmjs.com/package/react-static-plugin-favicons) - Generate (fav)icons in many different sizes for many different platforms, and add them to your site's metadata

#### Local Plugins via the `/plugins` directory

If you have a custom plugin or are developing a plugin locally, you can place your plugin directory in the `/plugins` directory in your project root. It can then be used by React Static.

#### Local Plugin API via the `/node.api.js` and `/browser.api.js` project files

If you simply need direct access to the the plugin API for a project, you can create a `node.api.js` and/or `browser.api.js` file in the root of your project. These files are treated just like plugins themselves, but do not receive plugin options and are executed very last in the plugin cycle.

## Using & Configuring Plugins

After installation, configure it by adding it to the `plugins` array in `static.config.js`:

```javascript
// static.config.js
export default {
  plugins: ['react-static-plugin-emotion', 'my-custom-plugin'],
}
```

#### Plugin Execution and Order (IMPORTANT)
Order of execution:
1. Plugins in `plugins: []`, starting from the first element of array.
2. Any `node.api.js` and `browser.api.js` files at the project root.

#### Plugin Resolution

Plugins are resolved in this order:

1.  Plugins with an absolute path. Eg. `~/path/to/my/my-plugin` would resolve to that path.
2.  Plugins found in the `/plugins` directory of your project root. Eg. `my-plugin` would resolve to `/plugins/my-plugin`.
3.  Plugins found in `node_modules`. Eg. `react-static-plugin-emotion` would resolve to `node_modules/react-static-plugin-emotion`.

## Plugin Options

Plugins can be passed options by using an array (similar to how babel and eslint work).

- The first item in the array is the `plugin name string`
- The second item in the array is the `options object` that will be passed to the plugin

```javascript
// static.config.js

export default {
  plugins: [
    [
      'react-static-plugin-awesomeness',
      {
        isAwesome: true,
      },
    ],
  ],
}
```

## Plugin API
All plugins contains at least one of:
- `node.api.js` - Exposes the [Node Plugin API](/docs/plugins/node-api.md)
- `browser.api.js` - Exposes the [Browser Plugin API](/docs/plugins/browser-api.md)

## Why use separate node and browser entry points for plugins?

Separating plugin entrypoints avoids creating conflict with imported modules that may not be supported in both environments.

## How to write the `node.api.js` and `browser.api.js` files when creating plugins?
The file (for either environment) must:

- Provide a `function` as the `default export`
- That function receives an optional **user plugin options** argument
- **Return an `object`** providing any **API methods** to implement

Basic plugin example:
```javascript
export default pluginOptions => ({
  myCustomAPIMethod: options => {
    console.log('hello world');
  }
})

```

## What can plugins do?
- [Modify your `static.config.js`](/docs/plugins/node-api.md#config-function)
- [Transform your webpack config](/docs/plugins/node-api.md#webpack-functionfunction)
- [Append JSX to the Head of the app](/docs/plugins/node-api.md#head-componentfunction)
- [Customize your App's router](/docs/plugins/browser-api.md#router)
- and more!

View the [browser API docs](/docs/plugins/browser-api.md) and the [node API docs](/docs/plugins/node-api.md) for full list of API methods that can be implemented.

#### Plugins must be compiled if installed via node_modules
Only the `plugins` directory will be transformed by react-static's babel runtime.

Hence, when distributing your plugin, your plugin **must be ES5 compatible**.
- An example of a plugin compiled before distribution is [react-static-plugin-styled-components](https://github.com/nozzle/react-static-plugin-styled-components).
