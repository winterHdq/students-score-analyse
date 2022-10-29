<template>
  <div class="sortTemplate">
    <div class="btns">
      <div class="left">
        <el-button
          type="warning"
          @click="isShowName = !isShowName"
          v-if="radio == 1"
        >
          {{ isShowName ? '隐藏' : '显示' }}姓名
        </el-button>
        <el-button type="primary" @click="exportExcel">导出</el-button>
        <el-button type="danger" @click="onAddTable">添加到列表</el-button>
      </div>
      <div class="content">{{ subjects }}</div>
      <div class="right">
        <el-radio-group v-model="radio" @change="typeChangeHandle">
          <el-radio-button :label="1">表格</el-radio-button>
          <el-radio-button :label="2">图表</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <el-table
      :data="scoreTable"
      border
      :height="tableHeight"
      v-show="radio == 1"
    >
      <el-table-column
        :label="subjects"
        prop="label"
        width="100"
        align="center"
      ></el-table-column>
      <el-table-column #default="{ row }" :label="curTable.className">
        {{ row.value }}
        <span v-if="isShowName && row.isName">：{{ row.data | toList }}</span>
      </el-table-column>
    </el-table>
    <div v-if="radio == 2">
      <div
        style="width: auto; height: 270px"
        id="scoreName"
        class="echartitem"
      ></div>
      <div style="display: flex">
        <div
          style="width: 50%; height: 250px"
          id="scoreRegion"
          class="echartitem"
        ></div>
        <div
          style="width: 50%; height: 250px"
          id="rangRegion"
          class="echartitem"
        ></div>
      </div>
      <div style="display: flex">
        <div
          style="width: 50%; height: 200px"
          id="pass"
          class="echartitem"
        ></div>
        <div
          style="width: 50%; height: 200px"
          id="excellent"
          class="echartitem"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import baseMixin from '../base/baseMixin'
export default {
  name: 'SortTemplate',
  mixins: [baseMixin],
  props: {
    tableHeight: {
      type: Number,
      default: 500
    },
    subjects: {
      type: String,
      require: true
    },
    curTable: {
      type: Object,
      default() {
        return {}
      }
    },
    sortObj: {
      type: Object,
      default() {
        return {}
      }
    },
    scoreTable: {
      type: Array,
      default() {
        return []
      }
    },
    extendData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  filters: {
    toList(val) {
      if (Array.isArray(val)) {
        return val.map(item => item.name).join('、')
      } else {
        return val.name || ''
      }
    }
  },
  watch: {
    'curTable.id': {
      handler() {
        this.typeChangeHandle()
      }
    }
  },
  data() {
    return {
      isShowName: false,
      radio: 2,
      echartsScoreName: null,
      echartsScoreRegion: null,
      echartsRangRegion: null,
      echartsPass: null,
      echartsexcellent: null,
      echartTitleStyle: {
        color: '#5470c6',
        fontSize: '14px',
        lineHeight: 30
      }
    }
  },
  created() {
    this.typeChangeHandle()
  },
  destroyed() {
    this.destroyedEchart()
  },
  methods: {
    echartInit() {
      this.$nextTick(() => {
        this.echartsScoreNameInit()
        this.echartsScoreRegionInit()
        this.echartsRangRegionInit()
        this.echartsPassInit()
        this.echartsexcellentInit()
      })
    },
    typeChangeHandle() {
      this.radio == 1 ? this.destroyedEchart() : this.echartInit()
    },
    // 分数折线表
    echartsScoreNameInit() {
      this.echartsScoreName = this.$echarts.init(
        document.getElementById('scoreName')
      )
      const _this = this
      const options = {
        title: {
          text: '成绩排序表',
          textStyle: this.echartTitleStyle
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          }
        },
        xAxis: {
          name: '姓名',
          type: 'category',
          data: this.extendData.scoreList.map(item => item.name),
          axisLabel: { interval: 0, rotate: 45 }
        },
        yAxis: {
          name: '分数',
          type: 'value',
          nameTextStyle: {
            padding: [0, 50, 5, 0]
          }
        },
        series: [
          {
            name: '分数',
            data: this.extendData.scoreList.map(item => item.score),
            type: 'line',
            markPoint: {
              data: [
                {
                  type: 'max',
                  name: '最高分'
                },
                {
                  type: 'min',
                  name: '最低分'
                }
              ]
            },
            markLine: {
              data: [
                {
                  type: 'average',
                  name: '平均分'
                }
              ],
              label: {
                formatter(item) {
                  return `${item.name}：${item.value}\n均分人数：${_this.sortObj.averageNum}`
                }
              }
            }
          }
        ]
      }
      this.echartsScoreName.setOption(options)
    },
    // 分数段柱状图
    echartsScoreRegionInit() {
      this.echartsScoreRegion = this.$echarts.init(
        document.getElementById('scoreRegion')
      )
      const options = {
        title: {
          text: '成绩分析表',
          textStyle: this.echartTitleStyle
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          true: false
        },
        xAxis: {
          name: '分数',
          type: 'category',
          data: this.extendData.scoreRegionList.map(item => item.label),
          axisLabel: { interval: 0, rotate: 20 }
        },
        yAxis: {
          name: '人数',
          type: 'value'
        },
        series: [
          {
            name: '人数',
            data: this.extendData.scoreRegionList.map(item => item.value),
            type: 'bar',
            label: {
              show: true
            },
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(220, 220, 220, 0.8)'
            }
          }
        ]
      }
      this.echartsScoreRegion.setOption(options)
    },
    // 名次段柱状图
    echartsRangRegionInit() {
      this.echartsRangRegion = this.$echarts.init(
        document.getElementById('rangRegion')
      )
      const options = {
        title: {
          text: '名次分析表',
          textStyle: this.echartTitleStyle
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          true: false
        },
        xAxis: {
          name: '名次',
          type: 'category',
          data: this.extendData.rangRegionList.map(item => item.label),
          axisLabel: { interval: 0, rotate: 0 }
        },
        yAxis: {
          name: '人数',
          type: 'value'
        },
        series: [
          {
            name: '人数',
            data: this.extendData.rangRegionList.map(item => item.value),
            type: 'bar',
            label: {
              show: true
            },
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(220, 220, 220, 0.8)'
            }
          }
        ]
      }
      this.echartsRangRegion.setOption(options)
    },
    // 及格率
    echartsPassInit() {
      this.echartsPass = this.$echarts.init(document.getElementById('pass'))
      let options = {
        title: {
          text: '及格率',
          textStyle: this.echartTitleStyle
        },
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            name: '人数',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'inside',
              formatter: '{d}%'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '14',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: this.sortObj.pass.length, name: '及格数' },
              { value: this.sortObj.noPass.length, name: '不及格数' }
            ]
          }
        ],
        legend: {
          show: true,
          zlevel: 0,
          z: 2,
          left: 'center',
          formatter(name) {
            const val =
              name == '及格数'
                ? options.series[0].data[0].value
                : options.series[0].data[1].value
            return `${name}：${val}`
          }
        }
      }
      this.echartsPass.setOption(options)
    },
    // 优秀率
    echartsexcellentInit() {
      this.echartsexcellent = this.$echarts.init(
        document.getElementById('excellent')
      )
      const options = {
        title: {
          text: '优秀率',
          textStyle: this.echartTitleStyle
        },
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            name: '人数',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'inside',
              formatter: '{d}%'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '14',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: this.sortObj.excellent.length, name: '优秀数' },
              {
                value: this.sortObj.peopleNum - this.sortObj.excellent.length,
                name: '其他'
              }
            ]
          }
        ],
        legend: {
          show: true,
          zlevel: 0,
          z: 2,
          left: 'center',
          formatter(name) {
            console.log(name)
            const val =
              name == '优秀数'
                ? options.series[0].data[0].value
                : options.series[0].data[1].value
            return `${name}：${val}`
          }
        }
      }
      this.echartsexcellent.setOption(options)
    },
    // 注销
    destroyedEchart() {
      this.echartsScoreName && this.echartsScoreName.dispose()
      this.echartsScoreRegion && this.echartsScoreRegion.dispose()
      this.echartsRangRegion && this.echartsRangRegion.dispose()
      this.echartsPass && this.echartsPass.dispose()
      this.echartsexcellent && this.echartsexcellent.dispose()
    },
    // 导出
    exportExcel() {
      const table = this.tableHandle()
      this.baseExportExcel(table)
    },
    // 添加到列表
    onAddTable() {
      const table = this.tableHandle()
      this.$store.commit('addTable', table)
      this.$store.commit('setCurTableId', table.id)
      this.$emit('onAddTable')
    },
    tableHandle() {
      let data = []
      this.$el
        .getElementsByTagName('table')[1]
        .childNodes[1].childNodes.forEach(item => {
          if (item.tagName !== 'TR') return
          let _item = {}
          let textContent = item.childNodes[0].textContent
          if (textContent == this.subjects) return
          _item[this.subjects] = textContent
          _item[this.curTable.className] = item.childNodes[1].textContent.trim()
          data.push(_item)
        })
      const table = {
        id: Date.now(),
        column: Object.keys(data[0]),
        data: data,
        name: `${this.curTable.name}-${this.curTable.className}-${this.subjects}分析表`,
        className: this.curTable.className,
        isCompare: false,
        template: 'sortTemplate',
        extend: {
          subjects: this.subjects,
          extendData: this.extendData,
          sortObj: this.sortObj,
          scoreTable: this.scoreTable
        }
      }
      return table
    }
  }
}
</script>

<style lang="scss" scoped>
.sortTemplate {
  .btns {
    display: flex;
    padding: 13px;
    .content {
      flex: 1;
      color: #fff;
      text-align: center;
      font-weight: bold;
    }
    .right {
      margin: 0 auto;
    }
  }
  .echartitem {
    border: 1px solid #e5e7eb;
    box-shadow: rgb(10 9 9 / 10%) 0px 0px 5px;
    margin: 5px;
    border-radius: 5px;
    background: #fff;
  }
}
</style>
