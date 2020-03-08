// eslint-disable-next-line @typescript-eslint/no-var-requires
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

module.exports = {
  lintOnSave: false,
  css: {
    extract: false,
    loaderOptions: {
    },
  },
  chainWebpack: config => {
    config.plugins.delete('pwa')
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
    config.plugins.delete('workbox')

    config.module.rule('images').use('url-loader').loader('url-loader')
      .tap(options => {
        return {
          ...options,
          limit: 1024*1024*1024,
        }
      })
  },
  configureWebpack: (config) => {
    config.plugins.push(
      new ScriptExtHtmlWebpackPlugin({
        inline: ['app', 'chunk']
      })
    );
  },
};
