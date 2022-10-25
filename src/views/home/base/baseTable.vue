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
        v-for="item in table.column"
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
    },
    // 是否进退比较
    isCompare: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    table() {
      this.$nextTick(() => {
        this.$refs.table && this.$refs.table.doLayout()
      })
    }
  },
  computed: {
    subjectObj() {
      return this.$store.getters.subjectObj
    },
    subjectRankList() {
      return this.table.column.filter(item => item.indexOf('进退') > 0)
    }
  },
  data() {
    return {}
  },
  methods: {
    scoreStyle(row, key) {
      let { subjectObj, subjectRankList } = this
      if (this.isCompare) {
        if (subjectRankList.includes(key) && row[key] < 0) {
          return { color: 'red' }
        }
      } else {
        if (subjectObj[key] && row[key] < subjectObj[key].passScore) {
          return { color: 'red' }
        }
      }
      return {}
    }
  }
}
</script>

<style lang="scss" scoped>
.base-table {
}
</style>
