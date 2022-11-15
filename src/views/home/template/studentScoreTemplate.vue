<template>
  <div class="studentScoreTemplate">
    <div class="btns">
      <div class="name">
        <el-checkbox-group
          v-model="nameCheck"
          @change="nameCheckChange"
          class="nameCheck"
          :min="1"
        >
          <el-checkbox
            v-for="item in defaultTable.data"
            :key="item['姓名']"
            :label="item['姓名']"
            :value="item['姓名']"
            style="width: 70px"
          ></el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="right">
        <el-radio-group v-model="radio" @change="typeChangeHandle">
          <el-radio-button :label="1">表格</el-radio-button>
          <el-radio-button :label="2">图表</el-radio-button>
        </el-radio-group>
        <br />
        <div class="btn">
          <base-score-analyse-btn
            btnName="修改"
            :table="curTable"
          ></base-score-analyse-btn>
          <base-echart-download-btn
            :name="nameCheck"
          ></base-echart-download-btn>
        </div>
      </div>
    </div>
    <div class="content" :style="{ height: `${contentHeight}px` }">
      <base-table
        ref="baseTable"
        :table-height="contentHeight"
        :table="table"
        v-if="radio == 1"
      ></base-table>
      <div v-if="radio == 2">
        <div class="echarts" id="echarts">
          <div
            style="width: 100%; height: 250px"
            id="reducedRank"
            class="echartitem"
          ></div>
          <div
            style="width: 48%; height: 250px"
            id="totalRank"
            class="echartitem"
          ></div>
          <template v-for="item in subjectMap">
            <div
              v-show="isShowEhart[item.key]"
              :key="item.key"
              style="width: 48%; height: 250px"
              :id="item.key"
              class="echartitem"
            />
          </template>
        </div>
        <!-- <div
          style="width: auto; height: 250px"
          id="summary"
          class="echartitem"
        /> -->
      </div>
    </div>
  </div>
</template>

<script>
import BaseTable from '../base/baseTable'
import baseMixin from '../base/baseMixin'
import BaseScoreAnalyseBtn from '../base/baseScoreAnalyseBtn'
import BaseEchartDownloadBtn from '../base/baseEchartDownloadBtn'
export default {
  name: 'StudentScoreTemplate',
  components: {
    BaseTable,
    BaseScoreAnalyseBtn,
    BaseEchartDownloadBtn
  },
  mixins: [baseMixin],
  props: {
    selectTablesId: {
      type: Array,
      default() {
        return []
      }
    },
    tableHeight: {
      type: Number,
      default: 450
    }
  },
  watch: {
    curTableId: {
      handler() {
        this.getTables()
      }
    },
    isShowMenu() {
      this.echartsResize()
    }
  },
  computed: {
    tables() {
      return this.$store.state.tables
    },
    curTableId() {
      return this.$store.state.curTableId
    },
    subjectMap() {
      return this.$store.state.subjectMap
    },
    isShowMenu() {
      return this.$store.state.isShowMenu
    },
    curTable() {
      return this.$store.getters.curTable || {}
    }
  },
  mounted() {
    this.contentHeight =
      this.tableHeight - this.$el.childNodes[0].offsetHeight + 55
  },
  data() {
    return {
      radio: 2,
      nameCheck: [],
      nameList: [],
      selectTables: [],
      defaultTable: [],
      column: [],
      contentHeight: 500,
      table: {},
      xAxisData: [],
      zsmSeries: {},
      echarts: {
        reducedRank: null,
        totalRank: null
        // summary: null
      },
      isShowEhart: {}
    }
  },
  created() {
    this.subjectMap.forEach(item => {
      this.$set(this.echarts, item.key, null)
      this.$set(this.isShowEhart, item.key, true)
    })
    this.getTables()
  },
  destroyed() {
    this.destroyedEchart()
  },
  methods: {
    getTables() {
      let result = true
      let selectTables = []
      this.selectTablesId.find(id => {
        let res = this.tables.find(v => v.id == id)
        if (!res) {
          result = false
          this.$message.error(`【${id}】原始表未找到，可能已被删除`)
          return true
        } else {
          selectTables.push(res)
        }
      })
      if (!result) return false
      this.selectTables = selectTables
      this.getInit(selectTables)
    },
    getInit(selectTables) {
      this.defaultTable = selectTables[0]
      this.nameCheck = [this.defaultTable.data[0]['姓名']]
      this.getColumn()
      this.getTable()
    },
    getColumn() {
      this.column = this.subjectMap.reduce((pre, cur) => {
        pre.push(cur.scoreKey)
        pre.push(cur.rankKey)
        return pre
      }, [])
      this.column.push(...['总分', '段名', '折总', '折算名'])
    },
    getTable(selectTables = this.selectTables) {
      let list = [],
        xAxisData = []
      const className = this.defaultTable.className
      selectTables.forEach(table => {
        xAxisData.push(table.name)
        let nameItem = table.data.find(
          item => item['姓名'] == this.nameCheck[0]
        )
        let _item = {}
        _item[className] = table.name
        this.column.forEach(k => {
          _item[k] = nameItem[k] || null
        })
        list.push(_item)
      })
      this.table = {
        name: `${this.nameCheck[0]}成绩分析`,
        id: Date.now(),
        data: list,
        column: Object.keys(list[0]),
        className: className
      }
      this.xAxisData = xAxisData
      this.getZsmData()
      this.typeChangeHandle()
    },
    // 获取折算名数据
    getZsmData() {
      this.zsmSeries = this.getSeries('折算名')
    },
    nameCheckChange(val) {
      this.nameCheck = val.splice(1, 1)
      this.getTable()
    },
    typeChangeHandle() {
      this.radio == 1 ? this.destroyedEchart() : this.echartInit()
    },
    destroyedEchart() {
      for (let k in this.echarts) {
        this.echarts[k] && this.echarts[k].dispose()
      }
    },
    echartInit() {
      this.$nextTick(() => {
        // this.echartsSummaryInit()
        this.echartsReducedRankInit()
        this.echartsInitHandle({
          name: '段名',
          key: 'totalRank',
          rankKey: '段名'
        })
        this.subjectMap.forEach(item => {
          this.echartsInitHandle(item)
        })
      })
    },
    getSeries(k) {
      const data = this.table.data.map(item => item[k])
      return {
        name: k,
        type: 'line',
        label: {
          show: true
        },
        data: data
      }
    },
    echartsReducedRankInit() {
      this.echarts.reducedRank = this.$echarts.init(
        document.getElementById('reducedRank')
      )
      const options = {
        title: {
          text: '折算名分析',
          textStyle: {
            fontSize: '14px',
            lineHeight: 30
          }
        },
        grid: {
          top: 75,
          bottom: 35
        },
        legend: {
          show: true,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          }
        },
        xAxis: {
          name: '表名',
          type: 'category',
          data: this.xAxisData,
          position: 'top'
        },
        yAxis: {
          name: '名次',
          type: 'value',
          inverse: true //反转坐标轴
        },
        series: this.zsmSeries
      }
      this.echarts.reducedRank.setOption(options)
    },
    echartsSummaryInit() {
      let series = [this.getSeries('段名')]
      this.subjectMap.forEach(item => {
        series.push(this.getSeries(item.rankKey))
      })
      this.echarts.summary = this.$echarts.init(
        document.getElementById('summary')
      )
      const options = {
        title: {
          text: '汇总分析',
          textStyle: {
            fontSize: '14px',
            lineHeight: 30
          }
        },
        grid: {
          top: 75,
          bottom: 35
        },
        legend: {
          show: true,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          }
        },
        xAxis: {
          name: '表名',
          type: 'category',
          data: this.xAxisData,
          position: 'top'
        },
        yAxis: {
          name: '名次',
          type: 'value',
          inverse: true //反转坐标轴
        },
        series: series
      }
      this.echarts.summary.setOption(options)
    },
    echartsInitHandle(obj) {
      let series = [this.getSeries(obj.rankKey)]
      series.push(this.zsmSeries)
      this.echarts[`${obj.key}`] = this.$echarts.init(
        document.getElementById(obj.key)
      )
      const options = {
        title: {
          text: `${obj.rankKey}分析`,
          textStyle: {
            fontSize: '14px',
            lineHeight: 30
          }
        },
        grid: {
          top: 75,
          bottom: 35
        },
        legend: {
          show: true,
          left: 'center',
          selected: {
            折算名: false
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          }
        },
        xAxis: {
          name: '表名',
          type: 'category',
          position: 'top',
          data: this.xAxisData
        },
        yAxis: {
          name: '名次',
          type: 'value',
          inverse: true //反转坐标轴
        },
        series: series
      }
      this.echarts[`${obj.key}`].setOption(options)
    },
    echartsResize() {
      setTimeout(() => {
        for (let k in this.echarts) {
          this.echarts[k].resize()
        }
      }, 500)
    }
  }
}
</script>

<style lang="scss" scoped>
.studentScoreTemplate {
  position: relative;
  .btns {
    display: flex;
    padding: 10px;
    .name {
      flex: 1;
    }
    .right {
      .btn {
        margin-top: 10px;
      }
    }
  }
  .content {
    overflow: auto;
  }
  .echartitem {
    border: 1px solid #e5e7eb;
    box-shadow: rgb(10 9 9 / 10%) 0px 0px 5px;
    margin: 5px;
    border-radius: 5px;
    background: #fff;
  }
  .echarts {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }
  @media print {
    .btns {
      display: none;
    }
  }
  ::v-deep {
    .el-checkbox__label {
      color: #fff;
    }
    .el-checkbox__input.is-disabled + span.el-checkbox__label {
      color: #409eff;
    }
    .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner {
      background-color: #409eff;
      border-color: #409eff;
    }
  }
}
</style>
