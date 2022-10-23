<template>
  <div class="base-table">
    <el-table
      ref="table"
      :data="table.data"
      border
      stripe
      highlight-current-row
      :height="tableHeight"
    >
      <el-table-column
        fixed
        label="序号"
        type="index"
        align="center"
      ></el-table-column>
      <el-table-column
        v-for="item in table.th"
        :key="item"
        :label="item"
        :prop="item"
        :fixed="item.indexOf('班级') >= 0 || item == '姓名'"
        :sortable="item.indexOf('班级') == -1 && item !== '姓名'"
        align="center"
        #default="{ row }"
      >
        <span :style="scoreStyle(row, item)">{{ row[item] }}</span>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  name: 'BaseTable',
  props: {
    tableHeight: {
      type: Number,
      default: 500
    },
    table: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {}
  },
  methods: {
    scoreStyle(row, key) {
      debugger
      console.log(row, key)
      return {}
    }
  }
}
</script>

<style lang="scss" scoped>
.base-table {
}
</style>
