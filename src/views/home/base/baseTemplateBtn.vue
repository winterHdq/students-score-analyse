<template>
  <div class="baseTemplateBtn">
    <el-button
      type="success"
      size="small"
      plain
      @click="dialogVisiable = !dialogVisiable"
    >
      模板
    </el-button>
    <el-dialog
      title="模板"
      :visible.sync="dialogVisiable"
      width="80%"
      :close-on-click-modal="false"
    >
      <el-button type="primary" @click="onExport">导出</el-button>
      <div class="rules">
        <h3>表格规则</h3>
        <p>1、【姓名】列必须存在；</p>
        <p>
          2、列名必须一致，但位置可变，可多可少。例如：姓名、语文、数学、总分、段名
        </p>
      </div>
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
    this.table.column.push(...['总分', '段名', '折总', '折算名'])
    for (let i = 0; i < 3; i++) {
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
  .rules {
    p {
      font-size: 15px;
      line-height: 24px;
      // text-indent: 2em;
    }
  }
  .table {
    td {
      height: 20px;
    }
  }
}
</style>
