<template>
  <div class="menuList">
    <el-menu
      default-active=""
      v-for="item in menu"
      :key="item.id"
      :collapse="!isShowMenu"
      background-color="transparent"
      text-color="#fff"
    >
      <menu-item :menu-item="item"></menu-item>
    </el-menu>
  </div>
</template>

<script>
import MenuItem from './menuItem'
export default {
  name: 'menuList',
  props: {
    isShowMenu: {
      type: Boolean,
      required: true
    }
  },
  components: {
    MenuItem
  },
  data() {
    return {
      menu: [
        {
          name: '文件夹1',
          id: '1',
          childrens: [
            {
              name: '文件1-1',
              id: '1-1'
              // childrens: [
              //   {
              //     name: '文件1-1-1',
              //     id: '1-1-1'
              //   }
              // ]
            },
            {
              name: '文件1-2',
              id: '1-2'
            }
          ]
        },
        {
          name: '文件夹2',
          id: '2',
          childrens: [
            {
              name: '文件2-1',
              id: '2-1'
            }
          ]
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.menuList {
  &:not(.el-menu--collapse) {
    width: 100%;
    height: 100%;
    overflow: auto;
  }
  ::v-deep {
    .el-submenu__title {
      height: 32px;
      line-height: 32px;
    }
    .el-submenu .el-menu-item {
      height: 30px;
      line-height: 30px;
    }
    .el-menu {
      .el-menu-item {
        &:last-child {
          &::before {
            height: 18px;
          }
        }
        &::before {
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
        &::after {
          content: '';
          left: 30px;
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
  }
}
</style>
