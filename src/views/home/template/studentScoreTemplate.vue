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
        <div>
          <base-score-analyse-btn
            btnName="修改"
            :table="curTable"
            class="btn"
          />
          <base-echart-download-btn
            ref="downloadBtn"
            :name="nameCheck[0]"
            :table="table"
            :radio="radio"
            @batchDownload="batchDownload"
          />
        </div>
      </div>
    </div>
    <div class="content" :style="{ height: `${contentHeight}px` }">
      <base-table
        ref="baseTable"
        :table-height="contentHeight"
        :table="table"
        :fixedCol="nameCheck"
        v-if="radio == 1"
      ></base-table>
      <div v-if="radio == 2">
        <div class="echarts" id="echarts">
          <p class="nameTitle" v-if="isShowEhart.name">{{ nameCheck[0] }}</p>
          <div
            v-show="isShowEhart.reducedRank"
            style="width: 100%; height: 250px"
            id="reducedRank"
            class="echartitem"
          ></div>
          <div
            v-show="isShowEhart.totalRank"
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
    <div class="downloadClose" v-if="downloadLoading">
      <el-button type="danger" @click="isCancelDownload = true">
        取消下载
      </el-button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import html2canvas from 'html2canvas'
import BaseTable from '../base/baseTable'
import BaseScoreAnalyseBtn from '../base/baseScoreAnalyseBtn'
import BaseEchartDownloadBtn from '../base/baseEchartDownloadBtn'
import { delectnNoFindTable, subtract, getYMin } from '@/common/utils'

export default {
  name: 'StudentScoreTemplate',
  components: {
    BaseTable,
    BaseScoreAnalyseBtn,
    BaseEchartDownloadBtn
  },
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
    ...mapState({
      tables: state => state.tables,
      curTableId: state => state.curTableId,
      subjectMap: state => state.subjectMap,
      isShowMenu: state => state.isShowMenu,
      downloadSetting: state => state.downloadSetting
    }),
    ...mapGetters(['curTable'])
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
      isShowEhart: {
        reducedRank: true,
        totalRank: true
      },
      downloadLoading: null,
      isCancelDownload: false
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
          delectnNoFindTable()
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
        pre.push(`${cur.rankKey.substr(0, 1)}差`)
        return pre
      }, [])
      this.column.push(
        ...['总分', '段名', '段差', '折总', '折算名', '优势', '劣势']
      )
    },
    getTableData(selectTables = this.selectTables, name = this.nameCheck[0]) {
      let list = [],
        xAxisData = []
      selectTables.forEach(table => {
        xAxisData.push(table.name)
        let nameItem = table.data.find(item => item['姓名'] == name) || {}
        let _item = {}
        _item[name] = table.name
        let totalRank = nameItem['折算名'] || nameItem['段名'] || null
        let dValueObj = { 优势: [], 劣势: [] }
        this.subjectMap.forEach(sub => {
          let dval = nameItem[sub.rankKey]
            ? subtract(totalRank, nameItem[sub.rankKey])
            : null
          dValueObj[`${sub.rankKey.substr(0, 1)}差`] = dval
          if (dval > 50) {
            dValueObj['优势'].push(sub.scoreKey)
          } else if (dval < -50) {
            dValueObj['劣势'].push(sub.scoreKey)
          }
        })
        dValueObj['段差'] = nameItem['段名']
          ? subtract(totalRank, nameItem['段名'])
          : null
        dValueObj['优势'] = dValueObj['优势'].join('、')
        dValueObj['劣势'] = dValueObj['劣势'].join('、')
        this.column.forEach(k => {
          _item[k] = nameItem[k] || dValueObj[k] || ''
        })
        list.push(_item)
      })
      this.xAxisData = xAxisData
      return {
        name: `${name}-成绩分析`,
        id: Date.now(),
        data: list,
        column: Object.keys(list[0]),
        isCompare: true,
        className: this.defaultTable.className,
        extends: {
          name
        }
      }
    },
    getTable(selectTables = this.selectTables, name = this.nameCheck[0]) {
      this.table = this.getTableData(selectTables, name)
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
        if (this.echarts[k]) {
          this.echarts[k].dispose()
          this.echarts[k] = null
        }
      }
    },
    echartInit() {
      this.$nextTick(() => {
        // this.echartsSummaryInit()
        this.isShowEhart.reducedRank && this.echartsReducedRankInit()
        this.isShowEhart.totalRank &&
          this.echartsInitHandle({
            name: '段名',
            key: 'totalRank',
            rankKey: '段名'
          })
        this.subjectMap.forEach(item => {
          this.isShowEhart[item.key] && this.echartsInitHandle(item)
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
      let Ymin = getYMin(this.zsmSeries.data)
      const yAxis = {
        name: '名次',
        min: Ymin,
        type: 'value',
        inverse: true //反转坐标轴
      }
      if (this.echarts.reducedRank) {
        this.echarts.reducedRank.setOption({
          series: this.zsmSeries,
          yAxis: yAxis
        })
        return
      }
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
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {}
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
        yAxis: yAxis,
        series: this.zsmSeries
      }
      this.echarts.reducedRank.setOption(options)
    },
    echartsSummaryInit() {
      let series = [this.getSeries('段名')]
      this.subjectMap.forEach(item => {
        series.push(this.getSeries(item.rankKey))
      })
      if (this.echarts.summary) {
        this.echarts.summary.setOption({
          series: series
        })
        return
      }
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
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {}
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
      let yMin = getYMin([...series[0].data, ...series[1].data])
      if (this.echarts[`${obj.key}`]) {
        this.echarts[`${obj.key}`].setOption({
          yAxis: {
            min: yMin
          },
          series: series
        })
        return
      }
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
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {}
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
          min: yMin,
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
    },
    // 一键下载
    async batchDownload() {
      if (this.radio == 1) {
        const table = {
          name: `${this.defaultTable.className}-学生成绩分析表`,
          id: Date.now(),
          className: this.defaultTable.className,
          sheets: []
        }
        this.defaultTable.data.forEach(item => {
          const name = item['姓名']
          if (!name) return
          table.sheets.push(this.getTableData(this.selectTables, name))
        })
        this.$refs.downloadBtn.onBatchDownLoadTable(table)
      } else {
        try {
          this.downloadLoading = this.$loading({
            lock: true,
            text: '正在拼命下载中......',
            spinner: 'el-icon-loading',
            fullscreen: true,
            background: 'rgba(0, 0, 0, 0.7)'
          })
          this.isShowEhart.name = true
          const checkedSubject = this.$refs.downloadBtn.formData.checkedSubject
          for (let k in this.echarts) {
            if (!checkedSubject.includes(k)) {
              this.isShowEhart[k] = false
            }
          }
          let dlTables = this.defaultTable.data
          for (let i = 0; i < dlTables.length; i++) {
            if (this.isCancelDownload) return
            const item = dlTables[i]
            const name = item['姓名']
            this.getTable(this.selectTables, name)
            await this.downloadEchart(name)
          }
        } finally {
          for (let k in this.isShowEhart) {
            this.isShowEhart[k] = true
          }
          this.isShowEhart.name = false
          this.$nextTick(() => {
            this.getTable()
            this.isCancelDownload = false
            this.downloadLoading.close()
            this.downloadLoading = null
            this.$refs.downloadBtn.disabledBtn = false
          })
        }
      }
    },
    downloadEchart(name) {
      return new Promise(resolve => {
        setTimeout(() => {
          // 图表转换成canvas
          html2canvas(document.getElementById('echarts')).then(canvas => {
            var img = canvas
              .toDataURL('image/png')
              .replace('image/png', 'image/octet-stream')
            // 创建a标签，实现下载
            var creatIMg = document.createElement('a')
            creatIMg.download = `${name}-成绩分析.png` // 设置下载的文件名，
            creatIMg.href = img // 下载url
            document.body.appendChild(creatIMg)
            creatIMg.click()
            creatIMg.remove() // 下载之后把创建的元素删除
            resolve()
          })
        }, 500)
      })
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
    .right {
      .btn {
        margin-top: 5px;
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
    .nameTitle {
      width: 100%;
      text-align: center;
      padding: 5px;
      font-size: 16px;
    }
  }
  .downloadClose {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, 50px);
    z-index: 3000;
  }
  @media print {
    .btns {
      display: none;
    }
  }
}
</style>
