<template>
  <div class="menu-item">
    <el-submenu :index="menuItem.id" v-if="menuItem.childrens">
      <template slot="title">
        <i class="el-icon-folder-opened"></i>
        {{ menuItem.name }}
      </template>
      <menu-item
        v-for="item in menuItem.childrens"
        :key="item.id"
        :menu-item="item"
      ></menu-item>
    </el-submenu>
    <el-menu-item v-else :index="menuItem.id">
      <i class="el-icon-document"></i>
      {{ menuItem.name }}
    </el-menu-item>
  </div>
</template>

<script>
export default {
  name: 'MenuItem',
  props: {
    menuItem: {
      type: Object,
      default() {
        return {}
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.menu-item {
}
</style>
