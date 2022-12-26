<template>
  <div class="menuSide">
    <el-menu
      :default-active="activeIndex"
      :collapse="!isShowMenu"
      background-color="transparent"
      text-color="#fff"
    >
      <menu-item v-for="item in menu" :key="item.id" :menu-item="item" />
    </el-menu>
  </div>
</template>

<script>
import MenuItem from './menuItem'
export default {
  name: 'MenuSide',
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
      activeIndex: '1-1-1-1',
      menu: [
        {
          name: '文件夹1',
          id: '1',
          childrens: [
            {
              name: '文件1-1',
              id: '1-1',
              childrens: [
                {
                  name: '文件1-1-1',
                  id: '1-1-1',
                  childrens: [
                    {
                      name: '文件1-1-1-1',
                      id: '1-1-1-1'
                    }
                  ]
                },
                {
                  name: '文件1-1-2',
                  id: '1-1-2'
                }
              ]
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
            },
            {
              name: '文件2-2',
              id: '2-2'
            }
          ]
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.menuSide {
  ::v-deep {
    .el-menu {
      border-right: 0px;
      .el-submenu__title {
        height: 32px;
        line-height: 32px;
      }
      .el-submenu .el-menu-item {
        height: 30px;
        line-height: 30px;
        position: relative;
      }
    }
  }
}
</style>
