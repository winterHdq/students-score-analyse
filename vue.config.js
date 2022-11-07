const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  devServer: {
    disableHostCheck: true // 关闭host检查
  }
})
