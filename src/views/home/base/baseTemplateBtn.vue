<template>
  <div class="baseTemplateBtn">
    <el-button
      type="success"
      size="small"
      @click="dialogVisiable = !dialogVisiable"
    >
      模板
    </el-button>
    <el-dialog title="模板" :visible.sync="dialogVisiable" width="80%">
      <el-button type="primary" @click="onExport">导出</el-button>
      <table class="table" border>
        <tr>
          <th v-for="item in table.column" :key="item">{{ item }}</th>
        </tr>
        <tr v-for="i in table.data.length" :key="i">
          <td v-for="item in table.column" :key="item"></td>
        </tr>
      </table>
    </el-dialog>
  </div>
</template>

<script>
import baseMixin from './baseMixin'
export default {
  name: 'BaseTemplateBtn',
  mixins: [baseMixin],
  data() {
    return {
      dialogVisiable: false,
      table: {
        id: Date.now(),
        name: '模板',
        column: [],
        data: []
      }
    }
  },
  computed: {
    subjectMap() {
      return this.$store.state.subjectMap
    }
  },
  created() {
    this.table.column = this.subjectMap.reduce(
      (pre, cur) => {
        pre.push(cur.scoreKey)
        pre.push(cur.rankKey)
        return pre
      },
      ['班级', '姓名']
    )
    for (let i = 0; i < 3; i++) {
      console.log(i)
      const item = {}
      this.table.column.forEach(key => (item[key] = ''))
      this.table.data.push(item)
    }
  },
  methods: {
    onExport() {
      this.baseExportExcel(this.table)
    }
  }
}
</script>

<style lang="scss" scoped>
.baseTemplateBtn {
  display: inline-block;
  .table {
    td {
      height: 20px;
    }
  }
}
</style>
