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
      <div class="right">
        <el-radio-group v-model="radio">
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
    <div v-show="radio == 2">
      <div style="width: auto; height: 300px" id="scoreName"></div>
      <div style="display: flex">
        <div style="width: 50%; height: 300px" id="scoreRegion"></div>
        <div style="width: 50%; height: 300px" id="rangRegion"></div>
      </div>
      <div style="display: flex">
        <div style="width: 50%; height: 200px" id="pass"></div>
        <div style="width: 50%; height: 200px" id="excellent"></div>
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
        this.destroyedEchart()
        this.echartInit()
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
      echartsexcellent: null
    }
  },
  mounted() {
    this.echartInit()
  },
  destroyed() {
    this.destroyedEchart()
  },
  methods: {
    echartInit() {
      this.echartsScoreNameInit()
      this.echartsScoreRegionInit()
      this.echartsRangRegionInit()
      this.echartsPassInit()
      this.echartsexcellentInit()
    },
    // 分数折线表
    echartsScoreNameInit() {
      this.echartsScoreName = this.$echarts.init(
        document.getElementById('scoreName')
      )
      this.echartsScoreName.setOption({
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
          type: 'value'
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
              ]
            }
          }
        ]
      })
    },
    // 分数段柱状图
    echartsScoreRegionInit() {
      this.echartsScoreRegion = this.$echarts.init(
        document.getElementById('scoreRegion')
      )
      this.echartsScoreRegion.setOption({
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
          type: 'value'
        },
        series: [
          {
            name: '人数',
            data: this.extendData.scoreRegionList.map(item => item.value),
            type: 'bar',
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(220, 220, 220, 0.8)'
            }
          }
        ]
      })
    },
    // 名次段柱状图
    echartsRangRegionInit() {
      this.echartsRangRegion = this.$echarts.init(
        document.getElementById('rangRegion')
      )
      this.echartsRangRegion.setOption({
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
          type: 'value'
        },
        series: [
          {
            name: '人数',
            data: this.extendData.rangRegionList.map(item => item.value),
            type: 'bar',
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(220, 220, 220, 0.8)'
            }
          }
        ]
      })
    },
    // 及格率
    echartsPassInit() {
      this.echartsPass = this.$echarts.init(document.getElementById('pass'))
      this.echartsPass.setOption({
        tooltip: {
          trigger: 'item'
        },
        legend: {
          show: true,
          zlevel: 0,
          z: 2,
          left: 'center'
        },
        series: [
          {
            name: '人数',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
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
        ]
      })
    },
    // 优秀率
    echartsexcellentInit() {
      this.echartsexcellent = this.$echarts.init(
        document.getElementById('excellent')
      )
      this.echartsexcellent.setOption({
        tooltip: {
          trigger: 'item'
        },
        legend: {
          show: true,
          zlevel: 0,
          z: 2,
          left: 'center'
        },
        series: [
          {
            name: '人数',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
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
        ]
      })
    },
    // 注销
    destroyedEchart() {
      debugger
      this.echartsScoreName.dispose()
      this.echartsScoreRegion.dispose()
      this.echartsRangRegion.dispose()
      this.echartsPass.dispose()
      this.echartsexcellent.dispose()
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
    .left {
      flex: 1;
    }
    .right {
      margin: 0 auto;
    }
  }
}
</style>
