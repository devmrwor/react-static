export default function () {
  return [
    {
      loader: 'url-loader',
      exclude: /\.(js|jsx|css)(\?.*)?$/,
      query: {
        limit: 10000,
        name: 'static/[name].[hash:8].[ext]',
      },
    },
  ]
}
