![React Static Logo](https://github.com/nozzle/react-static/raw/master/media/logo.png)

[![Travis CI Build Status](https://travis-ci.org/nozzle/react-static.svg?branch=master)](https://travis-ci.org/nozzle/react-static) [![David Dependancy Status](https://david-dm.org/nozzle/react-static.svg)](https://david-dm.org/nozzle/react-static) [![npm package v](https://img.shields.io/npm/v/react-static.svg)](https://www.npmjs.org/package/react-static) [![npm package dm](https://img.shields.io/npm/dm/react-static.svg)](https://npmjs.com/package/react-static) [![Join the community on Slack](https://img.shields.io/badge/slack-react--chat-blue.svg)](https://react-chat-signup.herokuapp.com/) [![Github Stars](https://img.shields.io/github/stars/nozzle/react-static.svg?style=social&label=Star)](https://github.com/nozzle/react-static) [![Twitter Follow](https://img.shields.io/twitter/follow/nozzleio.svg?style=social&label=Follow)](https://twitter.com/nozzleio)

<br>
<br>

# React Static
A **progressive static-site generator** for React.

[**Read the introduction article on Medium**](https://medium.com/@tannerlinsley/%EF%B8%8F-introducing-react-static-a-progressive-static-site-framework-for-react-3470d2a51ebc)

React-Static is a fast, lightweight, and powerful framework for building static-progressive React applications and websites. It's been carefully designed to meet the highest standards of **SEO, site performance, and user/developer experience**.

## Features
- ⚛️ 100% React (or Preact!)
- 🚀 Blazing fast builds and performance.
- 🚚 Data Agnostic. Supply your site with data from anywhere, **however you want**.
- ✂️ Automatic code and data splitting for routes!
- 💥 Instant page views via [PRPL](https://developers.google.com/web/fundamentals/performance/prpl-pattern/) pattern.
- 🎯 Built for **SEO**.
- 🥇 React-first developer experience.
- 😌 Painless project setup & migration.
- 💯 Supports 100% of the React ecosystem. Including CSS-in-JS libraries, custom Query layers like GraphQL, and even Redux.
- 🔥 Hot Reloadable out-of-the-box. Edit React components & styles in real-time.
- 📲 LAN accessible dev environment for testing on other devices like phones and tablets.

## Videos & Tutorials
- [Get started in 5 minutes! (create-react-app template)](https://youtu.be/1pBzh7IM1s8) (5 min)
- [Introducing React-Static! How it works and why we built it!](https://www.youtube.com/watch?v=OqbJ5swVpDQ) (80 min)
- [Walkthrough - Installing and creating a new project with Styled Components](https://www.youtube.com/watch?v=KvlTVZPlmgs) (20 min)

## Sites Built with React-Static
- [Nozzle.io](https://nozzle.io)
- [Timber.io](https://timber.io)
- [Manta.life](https://manta.life)
- [Manticore Games](http://manticoregames.com)
- [BlackSandSolutions.co](https://www.blacksandsolutions.co)
- [David York - Pesonal Blog][http://davideyork.com]

## Quick Start

1. Install the CLI: (if you are migrating, please see [Migrating to React-Static](#migrating-to-react-static))
  ```bash
  $ yarn global add react-static
  # or
  $ npm install -g react-static
  ```
2. Create a new project:
  ```bash
  $ react-static create
  ```
3. Pick a template! [See the full list of templates](#examples-and-templates)
4. Navigate to your new project:
  ```bash
  $ cd my-static-site
  ```
5. Start the dev server and edit some code!
  ```bash
  $ yarn start
  ```
6. Build for production!
  ```bash
  $ yarn build
  ```
7. Test your build locally
  ```bash
  $ yarn serve
  ```

Once you've installed and test driven sufficiently, you may want to:
- [Read about the core concepts of React Static](/concepts)
- [Familiarize yourself with the API and all that is possible!](/api)
- [Join the slack organization!](https://react-chat-signup.herokuapp.com)

## Examples and Templates
All of the following examples can be used as a template at project creation.

- [Basic](https://github.com/nozzle/react-static/tree/master/examples/basic)
- [Blank (Create-React-App)](https://github.com/nozzle/react-static/tree/master/examples/blank)
- [Preact](https://github.com/nozzle/react-static/tree/master/examples/preact)
- [Animated Routes](https://github.com/nozzle/react-static/tree/master/examples/animated-routes)
- [Custom Routing](https://github.com/nozzle/react-static/tree/master/examples/custom-routing)
- [Dynamic Imports (code-splitting)](https://github.com/nozzle/react-static/tree/master/examples/dynamic-imports)
- [Dynamic Imports (code-splitting with SSR)](https://github.com/nozzle/react-static/tree/master/examples/dynamic-imports-with-ssr)
- [Firebase Auth](https://github.com/nozzle/react-static/tree/master/examples/firebase-auth)
- [Glamorous & Tailwind CSS](https://github.com/nozzle/react-static/tree/master/examples/glamorous-tailwind)
- [Glamorous](https://github.com/nozzle/react-static/tree/master/examples/glamorous)
- [LESS & Antdesign](https://github.com/nozzle/react-static/tree/master/examples/less-antdesign)
- [Styled-Components](https://github.com/nozzle/react-static/tree/master/examples/styled-components)
- [Redux](https://github.com/nozzle/react-static/tree/master/examples/redux)
- [Apollo GraphQL](https://github.com/nozzle/react-static/tree/master/examples/apollo)
- [Apollo & Redux](https://github.com/nozzle/react-static/tree/master/examples/apollo-redux)
- [TypeScript](https://github.com/nozzle/react-static/tree/master/examples/typescript)
- [Cordova (Hybrid App)](https://github.com/nozzle/react-static/tree/master/examples/cordova)
- [Basic Prismic (Headless CMS)](https://github.com/nozzle/react-static/tree/master/examples/basic-prismic)
- [GraphCMS](https://github.com/nozzle/react-static/tree/master/examples/graphql-request)
- [Sass](https://github.com/nozzle/react-static/tree/master/examples/sass)
- [Tailwind CSS](https://github.com/nozzle/react-static/tree/master/examples/tailwindcss)


Can't find an example? We invite you to write one! Simply copy the `basic` or `blank` templates and make the necessary changes. Then submit a PR including your new example directory and a new item in the list above. When merged, your example will automatically become a template in the CLI. How magical!

## Documentation
#### [Core Concepts](/concepts)
#### [API Reference](/api)

## Chat with us on Slack!
Need some help? Have a quick question? [Click here to sign up for the React-Tools slack org](https://react-chat-signup.herokuapp.com), and join us in the **#react-static** channel! We are constantly answering questions, discussing features and helping each other out!

## Contributing
We are always looking for people to help us grow `react-static`'s capabilities and examples. If you have an issue, feature request, or pull request, let us know!

## License
React Static uses the MIT license. For more information on this license, [click here](https://github.com/nozzle/react-static/blob/master/LICENSE).
