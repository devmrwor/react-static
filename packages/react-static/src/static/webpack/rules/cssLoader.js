import autoprefixer from 'autoprefixer'
import ExtractCssChunks from 'extract-css-chunks-webpack-plugin'
import postcssFlexbugsFixes from 'postcss-flexbugs-fixes'

function initCSSLoader() {
  const cssLoader = [
    {
      loader: 'css-loader',
      options: {
        importLoaders: 1,
        sourceMap: false,
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        // Necessary for external CSS imports to work
        // https://github.com/facebookincubator/create-react-app/issues/2677
        sourceMap: true,
        ident: 'postcss',
        plugins: () => [
          postcssFlexbugsFixes,
          autoprefixer({
            browsers: [
              '>1%',
              'last 4 versions',
              'Firefox ESR',
              'not ie < 9', // React doesn't support IE8 anyway
            ],
            flexbox: 'no-2009', // I'd opt in for this - safari 9 & IE 10.
          }),
        ],
      },
    },
  ]
  return cssLoader
}

export default function({ stage, isNode }) {
  let cssLoader = initCSSLoader(stage)
  if (stage === 'node' || isNode) {
    return {
      test: /\.css$/,
      loader: cssLoader,
    }
  }

  cssLoader = [ExtractCssChunks.loader, ...cssLoader] // seeing as it's HMR, why not :)

  return {
    test: /\.css$/,
    loader: cssLoader,
  }
}
