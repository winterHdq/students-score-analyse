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
      />
    </el-submenu>
    <el-menu-item v-else :index="menuItem.id">
      <i class="el-icon-document" />
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
  ::v-deep {
    .el-submenu {
      .menu-item {
        position: relative;
        .el-submenu::before {
          content: '';
          left: 30px;
          position: absolute;
          right: auto;
          border-width: 1px;
          border-left: 1px dashed #fff;
          bottom: 0px;
          height: 100%;
          top: 0;
          width: 1px;
        }
        &:last-child .el-menu-item {
          &::before {
            height: 18px;
          }
        }
      }
      .el-menu-item,
      li > .el-submenu__title {
        &::before {
          content: '';
          margin-left: -10px;
          position: absolute;
          right: auto;
          border-width: 1px;
          border-left: 1px dashed #fff;
          bottom: 0px;
          height: 100%;
          top: 0;
          width: 1px;
        }
        i:first-child {
          &::after {
            content: '';
            margin-left: -30px;
            position: absolute;
            right: auto;
            border-width: 1px;
            border-top: 1px dashed #fff;
            height: 20px;
            top: 17px;
            width: 8px;
          }
        }
      }
      li > .el-submenu__title::before {
        height: 18px;
      }
    }
  }
}
</style>
