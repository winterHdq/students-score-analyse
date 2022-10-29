<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
* {
  padding: 0px;
  margin: 0px;
}
.table {
  width: 100%;
  max-width: 100%;
  background-color: transparent;
  border-collapse: collapse;
  border-spacing: 0;
  tr {
    th,
    td {
      padding: 2px 10px;
    }
    td:first-child {
      text-align: center;
    }
  }
}

// /* 设置滚动条的样式 */
// ::-webkit-scrollbar {
//   width: 10px;
// }
// /* 滚动槽 */
// ::-webkit-scrollbar-track {
//   background: rgba(144, 147, 153, 0.2);
// }
// /* 滚动条滑块 */
// ::-webkit-scrollbar-thumb {
//   border-radius: 3px;
//   background: rgba(191, 193, 197, 0.5);
// }
</style>
