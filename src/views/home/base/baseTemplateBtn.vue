<template>
  <div class="baseTemplateBtn">
    <el-button
      type="success"
      size="small"
      plain
      @click="dialogVisiable = !dialogVisiable"
    >
      模版
    </el-button>
    <el-dialog
      title="模板"
      :visible.sync="dialogVisiable"
      width="80%"
      :close-on-click-modal="false"
    >
      <div class="rules">
        <div>
          <h3>表格规则</h3>
          <p>1、【姓名】列必须存在；</p>
          <p>
            2、列名必须一致，但位置可变，可多可少。例如：姓名、语文、数学、总分、段名
          </p>
        </div>
        <div style="margin-left: auto">
          <el-button type="primary" @click="onExport">导出</el-button>
        </div>
      </div>
      <table class="table" border>
        <tr>
          <th v-for="item in table.column" :key="item">{{ item }}</th>
        </tr>
        <tr v-for="(i, index) in table.data" :key="index">
          <td v-for="item in table.column" :key="item" class="td">
            {{ i[item] }}
          </td>
        </tr>
      </table>
    </el-dialog>
  </div>
</template>

<script>
const templateData = [
  {
    班级: 10,
    姓名: '小黄',
    语文: 129,
    语名: 59,
    数学: 142,
    数名: 30,
    英语: 142,
    英名: 39,
    物理: 93,
    物名: 56,
    化学: 90,
    化名: 60,
    生物: 96,
    生名: 14,
    政治: 89,
    政名: 71,
    历史: 92,
    历名: 103,
    地理: 91,
    地名: 95,
    总分: 874,
    段名: 28,
    折总: 643,
    折算名: 26
  },

  {
    班级: 10,
    姓名: '小张',
    语文: 125,
    语名: 139,
    数学: 147,
    数名: 11,
    英语: 138,
    英名: 88,
    物理: 93,
    物名: 56,
    化学: 91,
    化名: 57,
    生物: 92,
    生名: 65,
    政治: 75,
    政名: 252,
    历史: 91,
    历名: 134,
    地理: 95,
    地名: 29,
    总分: 856,
    段名: 58,
    折总: 633,
    折算名: 47
  },
  {
    班级: 10,
    姓名: '小李',
    语文: 132,
    语名: 21,
    数学: 144,
    数名: 20,
    英语: 144,
    英名: 10,
    物理: 83,
    物名: 190,
    化学: 87,
    化名: 73,
    生物: 84,
    生名: 228,
    政治: 83,
    政名: 140,
    历史: 89,
    历名: 196,
    地理: 88,
    地名: 171,
    总分: 847,
    段名: 74,
    折总: 632,
    折算名: 48
  }
]

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
      const item = templateData[i]
      // this.table.column.forEach(key => (item[key] = ''))
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
    display: flex;
    align-items: end;
    p {
      font-size: 15px;
      line-height: 24px;
      // text-indent: 2em;
    }
  }
  .table {
    th:nth-child(2) {
      width: 30px;
    }
    td {
      height: 20px;
      text-align: center;
      font-size: 12px;
    }
  }
}
</style>
