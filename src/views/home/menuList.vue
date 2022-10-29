<template>
  <div class="menuList">
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
      <i class="el-icon-download btn" @click="exportExcel(item, $event)"></i>
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
</template>

<script>
import { classMap } from '@/constant/subject'
import baseMixin from './base/baseMixin'
export default {
  name: 'MenuList',
  mixins: [baseMixin],
  computed: {
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
