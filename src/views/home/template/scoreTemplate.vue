<template>
  <div class="scoreTemplate">
    <div class="btns">
      <div class="left">
        <base-class-setting
          ref="setting"
          v-model="curTable.className"
        ></base-class-setting>
        <template v-if="curTable.sortObj">
          <el-button
            type="primary"
            class="btn"
            plain
            @click="compaseDialog.show = true"
          >
            进退比较
          </el-button>
          <el-tooltip class="item" effect="dark" placement="top-start">
            <div slot="content">
              科目差值：折算名/段名 - 科目名
              <br />
              优势科目：科目差值 &gt; 50
              <br />
              劣势科目：科目差值 &lt; -50
            </div>
            <el-button
              type="primary"
              plain
              @click="rankCompareDialog.show = true"
            >
              优劣分析
            </el-button>
          </el-tooltip>
          <el-button
            plain
            type="primary"
            size="small"
            class="btn"
            @click="openSortDialog"
          >
            科目分析
          </el-button>
        </template>
      </div>
      <div class="title">{{ curTable.name }}</div>
      <div class="right">
        <el-radio-group v-model="radio" @change="typeChangeHandle">
          <el-radio-button :label="1">表格</el-radio-button>
          <el-radio-button :label="2">图表</el-radio-button>
        </el-radio-group>
        <base-export-btn
          :table="curTable"
          :isExportBtn="false"
          :isMultiple="true"
        ></base-export-btn>
      </div>
    </div>
    <div v-if="radio == 2" class="echarts">
      <el-checkbox-group
        v-model="nameCheck"
        @change="nameCheckChange"
        class="nameCheck"
        :min="1"
      >
        <el-checkbox
          v-for="name in nameList"
          :key="name"
          :label="name"
          :value="name"
          style="width: 70px"
        ></el-checkbox>
      </el-checkbox-group>
      <div class="content" :style="`height: ${tableHeight - 115}px`">
        <div
          style="width: 49%; height: 250px"
          id="scoreName"
          class="echartitem"
        />
        <div
          style="width: 49%; height: 250px"
          id="rankName"
          class="echartitem"
        />
        <div
          v-if="isPreCompare"
          style="width: 49%; height: 270px"
          id="compare"
          class="echartitem"
        />
      </div>
    </div>
    <base-table
      v-else
      ref="baseTable"
      :table-height="tableHeight"
      :table="curTable"
    ></base-table>
    <sort-dialog
      v-if="sortCompareDialog.show"
      :curTable="curTable"
      @onClose="sortCompareDialog.show = false"
    ></sort-dialog>
    <rank-compare-dialog
      v-if="rankCompareDialog.show"
      :curTable="curTable"
      @onClose="rankCompareDialog.show = false"
    ></rank-compare-dialog>
    <compase-dialog
      v-if="compaseDialog.show"
      :curTableId="curTable.id"
      @onClose="compaseDialog.show = false"
    ></compase-dialog>
  </div>
</template>

<script>
import BaseClassSetting from '../base/baseClassSetting'
import BaseTable from '../base/baseTable'
import SortDialog from '../components/sortDialog'
import { mapState, mapGetters } from 'vuex'
import BaseExportBtn from '../base/baseExportBtn'
import RankCompareDialog from '../components/rankCompareDialog'
import CompaseDialog from '../components/compareDialog'
import { getYMin } from '@/utils/utils'
// import baseMixin from '../base/baseMixin'
export default {
  name: 'ScoreTemplate',
  components: {
    BaseClassSetting,
    BaseTable,
    SortDialog,
    BaseExportBtn,
    RankCompareDialog,
    CompaseDialog
  },
  props: {
    tableHeight: {
      type: Number,
      default: 500
    }
  },
  data() {
    return {
      sortCompareDialog: {
        show: false
      },
      rankCompareDialog: {
        show: false
      },
      compaseDialog: {
        show: false
      },
      nameList: [],
      nameListObj: {},
      preNameListObj: {},
      radio: 1,
      nameCheck: [],
      echartsScoreName: null,
      echartsRankName: null,
      echartsCompare: null,
      xAxisData: [],
      xAxisRankData: [],
      contentHeight: 300
    }
  },
  computed: {
    ...mapState({
      tables: state => state.tables,
      subjectMap: state => state.subjectMap,
      isShowMenu: state => state.isShowMenu
    }),
    ...mapGetters(['curTable', 'subjectList', 'subjectRankList']),
    // 是否进退比较表
    isPreCompare() {
      return this.curTable.isCompare && this.curTable?.extend?.compareColumn
    }
  },
  watch: {
    'curTable.id': {
      handler() {
        this.dataInitHandle()
        this.typeChangeHandle()
      },
      immediate: true
    },
    isShowMenu() {
      this.echartsResize()
    }
  },
  mounted() {
    this.contentHeight =
      this.tableHeight - this.$el.childNodes[0].offsetHeight + 50
  },
  destroyed() {
    this.destroyedEchart()
  },
  methods: {
    dataInitHandle() {
      this.nameCheck = [this.curTable.data[0]['姓名']]
      let nameListObj = {}
      let nameList = [],
        xAxisData = [],
        xAxisRankData = []
      this.curTable.data.forEach(item => {
        let name = item['姓名']
        nameListObj[name] = item
        nameList.push(name)
      })
      this.nameList = nameList
      this.nameListObj = nameListObj
      // 去除不存在的科目
      this.curTable.column.forEach(key => {
        this.subjectList.includes(key) && xAxisData.push(key)
      })
      this.curTable.column.forEach(key => {
        this.subjectRankList.includes(key) && xAxisRankData.push(key)
      })
      this.xAxisData = xAxisData
      this.xAxisRankData = xAxisRankData
      if (this.isPreCompare) {
        this.compareInitHandle()
      }
    },
    // 比较初始化
    compareInitHandle() {
      ;(this.curTable?.extend?.preTable.data || []).forEach(item => {
        this.preNameListObj[item['姓名']] = item
      })
    },
    async openSortDialog() {
      try {
        await this.$refs.setting.validate()
        this.sortCompareDialog.show = true
      } catch (err) {
        console.log(err)
        this.$message.error('请先设置班级')
      }
    },
    typeChangeHandle() {
      this.radio == 1 ? this.destroyedEchart() : this.echartInit()
    },
    destroyedEchart() {
      ;['echartsScoreName', 'echartsRankName', 'echartsCompare'].forEach(
        key => {
          this[key] && this[key].dispose()
        }
      )
    },
    echartsResize() {
      setTimeout(() => {
        ;['echartsScoreName', 'echartsRankName', 'echartsCompare'].forEach(
          key => {
            this[key] && this[key].resize()
          }
        )
      }, 500)
    },
    echartInit() {
      this.$nextTick(() => {
        this.echartsScoreInit()
        this.echartsRankInit()
        this.echartsCompareInit()
      })
    },
    nameCheckChange(val) {
      this.nameCheck = val.splice(1, 1)
      const series = this.getSeries()
      this.echartsScoreName.setOption({
        series: series.score
      })
      const yMin = getYMin(series.rank[0].data)
      this.echartsRankName.setOption({
        series: series.rank,
        yAxis: {
          min: yMin
        }
      })
      if (this.isPreCompare) {
        const { series } = this.getCompaseConfig()
        // const yMin = getYMin([...series[0].data, ...series[1].data])
        this.echartsCompare.setOption({
          series: series
          // yAxis: {
          //   min: yMin
          // }
        })
      }
    },
    getSeries() {
      let series = {
        score: [],
        rank: []
      }
      this.nameCheck.forEach(name => {
        let item = {
          name: this.curTable.name.split('-')[0],
          type: 'line',
          label: {
            show: true
          },
          data: []
        }
        let rankItem = {
          name: this.curTable.name.split('-')[0],
          type: 'line',
          label: {
            show: true
          },
          data: []
        }
        let nameObj = this.nameListObj[name]
        this.xAxisData.forEach(key => {
          item.data.push(nameObj[key])
        })
        this.xAxisRankData.forEach(key => {
          rankItem.data.push(nameObj[key])
        })
        if (nameObj['折算名']) {
          rankItem.markLine = {
            data: [
              {
                name: '折算名',
                yAxis: nameObj['折算名']
              }
            ]
          }
        } else if (nameObj['段名']) {
          rankItem.markLine = {
            data: [
              {
                name: '段名',
                yAxis: nameObj['段名']
              }
            ]
          }
        }
        if (rankItem.markLine) {
          rankItem.markLine.label = {
            show: true,
            formatter: '{b}:{c}'
          }
        }
        series.score.push(item)
        series.rank.push(rankItem)
      })
      return series
    },
    echartsScoreInit() {
      let { score: series } = this.getSeries()
      this.echartsScoreName = this.$echarts.init(
        document.getElementById('scoreName')
      )
      const options = {
        title: {
          text: '成绩表',
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
          // type: 'scroll',
          left: 'center'
          // selectedMode: 'single',
          // selected: selected
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          }
        },
        xAxis: {
          name: '科目',
          type: 'category',
          data: this.xAxisData
        },
        yAxis: {
          name: '分数',
          type: 'value',
          nameTextStyle: {
            padding: [0, 50, 5, 0]
          }
        },
        series: series
      }
      this.echartsScoreName.setOption(options)
    },
    echartsRankInit() {
      let { rank: series } = this.getSeries()
      const yMin = getYMin(series[0].data)
      this.echartsRankName = this.$echarts.init(
        document.getElementById('rankName')
      )
      const options = {
        title: {
          text: '名次表',
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
          bottom: 35,
          right: 70
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
          name: '科目',
          type: 'category',
          position: 'top',
          data: this.xAxisRankData
        },
        yAxis: {
          min: yMin,
          name: '名次',
          type: 'value',
          inverse: true, //反转坐标轴
          nameTextStyle: {
            padding: [0, 50, 5, 0]
          }
        },
        series: series
      }
      this.echartsRankName.setOption(options)
    },
    // getCompaseConfig() {
    //   let preTable = this.curTable.extend.preTable
    //   let series = [
    //     {
    //       name: this.curTable.name,
    //       type: 'line',
    //       label: {
    //         show: true
    //       },
    //       data: []
    //     },
    //     {
    //       name: preTable.name,
    //       type: 'line',
    //       label: {
    //         show: true
    //       },
    //       data: []
    //     }
    //   ]
    //   let xAxis = this.curTable.extend.compareColumn
    //   const name = this.nameCheck[0]
    //   let curItem = this.nameListObj[name]
    //   let preItem = this.preNameListObj[name]
    //   xAxis.forEach(key => {
    //     curItem && series[0].data.push(curItem[key])
    //     preItem && series[1].data.push(preItem[key])
    //   })
    //   return {
    //     series,
    //     xAxis
    //   }
    // },
    getCompaseConfig() {
      let series = [
        {
          name: this.curTable.name,
          type: 'bar',
          barMaxWidth: '60',
          label: {
            show: true
          },
          data: []
        }
      ]
      let xAxis = this.curTable.extend.compareColumn
      const name = this.nameCheck[0]
      let curItem = this.nameListObj[name]
      xAxis.forEach(key => {
        const value = curItem[`${key}进退`]
        curItem &&
          series[0].data.push({
            value,
            itemStyle: {
              color: value > 0 ? '#3ba272' : '#ee6666'
            }
          })
      })
      return {
        series,
        xAxis
      }
    },
    echartsCompareInit() {
      if (!this.isPreCompare) return
      let { xAxis, series } = this.getCompaseConfig()
      this.echartsCompare = this.$echarts.init(
        document.getElementById('compare')
      )
      const options = {
        title: {
          text: '进退表',
          textStyle: {
            fontSize: '14px',
            lineHeight: 30
          }
        },
        toolbox: {
          show: true,
          feature: {
            magicType: { type: ['bar', 'line'] },
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
          name: '科目',
          type: 'category',
          position: 'top',
          data: xAxis
        },
        yAxis: {
          name: '进退名次',
          type: 'value',
          // inverse: true, //反转坐标轴
          nameTextStyle: {
            padding: [0, 50, 5, 0]
          }
        },
        series: series
      }
      this.echartsCompare.setOption(options)
    }
  }
}
</script>

<style lang="scss" scoped>
.scoreTemplate {
  .btns {
    display: flex;
    align-items: center;
    padding: 10px;
    .left {
      flex-wrap: wrap;
      display: flex;
      flex-shrink: 0;
    }
    .title {
      flex: 1;
      color: #fff;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .right {
      margin: 0 auto;
      flex-shrink: 0;
    }
  }
  .nameCheck {
    padding: 10px 20px;
  }
  .echarts {
    .echartitem {
      border: 1px solid #e5e7eb;
      box-shadow: rgb(10 9 9 / 10%) 0px 0px 5px;
      border-radius: 5px;
      margin-bottom: 10px;
      background: #fff;
    }
    .content {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around;
      align-content: flex-start;
      overflow: auto;
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
}
</style>
