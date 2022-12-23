<template>
  <div class="menuList" :style="{ width: isShowMenu ? '250px' : '50px' }">
    <div class="title">
      <p class="text" v-if="isShowMenu">列表</p>
      <i
        class="btn"
        id="menuHide"
        :class="isShowMenu ? 'el-icon-s-fold' : 'el-icon-s-unfold'"
        @click="$store.commit('setIsShowMenu', !isShowMenu)"
      ></i>
    </div>
    <menu-list-index :isShowMenu="isShowMenu"></menu-list-index>
    <!-- <transition name="el-fade-in-linear">
      <div v-show="isShowMenu">
        <p
          v-for="(item, index) in tables"
          :key="item.index"
          class="name-item"
          :class="{ 'name-item-active': item.id == curTable.id }"
          @click="changeTable(item)"
        >
          <span
            v-if="item.className"
            class="className"
            :style="{ background: classNameObj[item.className].bgColor }"
          >
            {{ item.className }}
          </span>
          <span class="name">{{ item.name }}</span>
          <i
            v-if="item.data"
            class="el-icon-download btn"
            @click="exportExcel(item, $event)"
          ></i>
          <i
            class="el-icon-delete-solid btn"
            style="padding-left: 5px"
            @click="delectTable(item, index, $event)"
          ></i>
          <i
            class="el-icon-top btn"
            style="padding-left: 3px"
            @click="upMove(index, $event)"
          ></i>
          <i class="el-icon-bottom btn" @click="downMove(index, $event)"></i>
        </p>
      </div>
    </transition>
    <transition name="el-fade-in">
      <div v-show="!isShowMenu">
        <p
          v-for="item in tables"
          :key="item.index"
          class="name-item"
          :class="{ 'name-item-active': item.id == curTable.id }"
          @click="changeTable(item)"
        >
          <span
            v-if="item.className"
            class="className"
            :style="{ background: classNameObj[item.className].bgColor }"
          >
            {{ item.className }}
          </span>
          <el-tooltip effect="dark" :content="item.name" placement="right">
            <i class="el-icon-document"></i>
          </el-tooltip>
        </p>
      </div>
    </transition> -->
  </div>
</template>

<script>
import { classMap } from '@/constant/subject'
import baseMixin from '../base/baseMixin'
import MenuListIndex from './menuList/index'
export default {
  name: 'MenuList',
  mixins: [baseMixin],
  components: {
    MenuListIndex
  },
  computed: {
    isShowMenu() {
      return this.$store.state.isShowMenu
    },
    tables() {
      return this.$store.state.tables
    },
    curTable() {
      return this.$store.getters.curTable || {}
    },
    classNameObj() {
      let obj = {}
      classMap.forEach(item => {
        obj[item.value] = item
      })
      return obj
    }
  },
  created() {
    this.$store.commit('getIsShowMenu')
  },
  methods: {
    changeTable(item) {
      this.$store.commit('setCurTableId', item.id)
    },
    exportExcel(data, e) {
      e.stopPropagation()
      this.baseExportExcel(data)
    },
    delectTable(item, index, e) {
      e.stopPropagation()
      this.$store.commit('deleteTable', index)
      if (item.id == this.curTableId) {
        this.$store.commit('setCurTableId', null)
      }
    },
    upMove(index, e) {
      e.stopPropagation()
      this.$store.commit('upMoveTables', index)
    },
    downMove(index, e) {
      e.stopPropagation()
      this.$store.commit('downMoveTables', index)
    }
  }
}
</script>

<style lang="scss" scoped>
$border-color: #409eff;
.menuList {
  height: 100%;
  overflow: auto;
  transition: width 0.5s;
  .title {
    background: #415f7d;
    color: #fff;
    display: flex;
    align-items: center;
    padding: 5px 10px;
    .text {
      flex: 1;
    }
    .btn {
      cursor: pointer;
      margin: 0 auto;
    }
  }
  .name-item {
    padding: 15px 5px 10px 5px;
    border-bottom: 1px solid $border-color;
    cursor: pointer;
    display: flex;
    align-items: center;
    position: relative;
    color: #fff;
    .className {
      position: absolute;
      z-index: 2;
      background: #d33525;
      top: 0px;
      right: 0px;
      font-size: 13px;
      padding: 0 5px;
      font-weight: bold;
    }
    .name {
      flex: 1;
    }
    .btn {
      margin: 0 auto;
      cursor: pointer;
      &:hover {
        color: #b7c6c7;
      }
    }
  }
  .name-item-active {
    background-color: $border-color;
  }
}
</style>
