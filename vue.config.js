const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  devServer: {
    port: 3000
    // disableHostCheck: true // 关闭host检查
  }
})
