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
            v-for="item in subjectMap"
            :key="item.type"
            plain
            type="primary"
            size="small"
            class="btn"
            @click="openSortDialog(item.name)"
          >
            {{ item.name }}分析
          </el-button>
        </template>
      </div>
      <div class="right">
        <el-radio-group v-model="radio" @change="typeChangeHandle">
          <el-radio-button :label="1">表格</el-radio-button>
          <el-radio-button :label="2">图表</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <div v-if="radio == 2">
      <div
        :style="{ width: 'auto', height: '350px' }"
        id="scoreName"
        class="echartitem"
      ></div>
      <div
        :style="{ width: 'auto', height: '250px' }"
        id="rankName"
        class="echartitem"
      ></div>
    </div>
    <base-table
      v-else
      ref="baseTable"
      :table-height="tableHeight"
      :table="curTable"
    ></base-table>
    <sort-dialog
      v-if="sortCompareDialog.show"
      :subjectName="sortCompareDialog.name"
      :curTable="curTable"
      @onClose="sortCompareDialog.show = false"
    ></sort-dialog>
  </div>
</template>

<script>
import BaseClassSetting from '../base/baseClassSetting'
import BaseTable from '../base/baseTable'
import SortDialog from '../sortDialog'
import { mapState, mapGetters } from 'vuex'
// import baseMixin from '../base/baseMixin'
export default {
  name: 'ScoreTemplate',
  components: {
    BaseClassSetting,
    BaseTable,
    SortDialog
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
        show: false,
        name: ''
      },
      radio: 2,
      echartsScoreName: null,
      echartsRankName: null
    }
  },
  computed: {
    ...mapState({
      subjectMap: state => state.subjectMap
    }),
    ...mapGetters(['curTable', 'subjectList', 'subjectRankList'])
  },
  watch: {
    'curTable.id': {
      handler() {
        this.typeChangeHandle()
      }
    }
  },
  created() {
    this.typeChangeHandle()
  },
  methods: {
    async openSortDialog(name) {
      try {
        await this.$refs.setting.validate()
        this.sortCompareDialog.name = name
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
      ;['echartsScoreName', 'echartsRankName'].forEach(key => {
        this[key] && this[key].dispose()
      })
    },
    echartInit() {
      this.$nextTick(() => {
        this.echartsScoreInit()
        this.echartsRankInit()
      })
    },
    echartsScoreInit() {
      let _this = this
      const xAxisData = []
      // 去除不存在的科目
      this.curTable.column.forEach(key => {
        this.subjectList.includes(key) && xAxisData.push(key)
      })
      let series = []
      let selected = {}
      this.curTable.data.forEach(item => {
        selected[item['姓名']] = false
        let _item = {
          name: item['姓名'],
          type: 'line',
          label: {
            show: true
          },
          data: []
        }
        xAxisData.forEach(key => {
          _item.data.push(item[key])
        })
        series.push(_item)
      })
      this.echartsScoreName = this.$echarts.init(
        document.getElementById('scoreName'),
        'dark'
      )
      const options = {
        title: {
          text: '成绩表',
          textStyle: {
            fontSize: '14px',
            lineHeight: 30
          }
        },
        grid: {
          top: 150,
          bottom: 35
        },
        legend: {
          show: true,
          // type: 'scroll',
          left: '70px',
          // selectedMode: 'single',
          selected: selected
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
          data: xAxisData
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
      this.echartsScoreName.on('legendselectchanged', val => {
        const scoreOptions = _this.echartsRankName.getOption()
        scoreOptions.legend[0].selected = val.selected
        _this.echartsRankName.setOption(scoreOptions)
      })
    },
    echartsRankInit() {
      const xAxisData = []
      // 去除不存在的科目
      this.curTable.column.forEach(key => {
        this.subjectRankList.includes(key) && xAxisData.push(key)
      })
      xAxisData.push('段名')
      let series = []
      let selected = {}
      this.curTable.data.forEach(item => {
        selected[item['姓名']] = false
        let _item = {
          name: item['姓名'],
          type: 'line',
          label: {
            show: true
          },
          data: []
        }
        xAxisData.forEach(key => {
          _item.data.push(item[key])
        })
        series.push(_item)
      })
      this.echartsRankName = this.$echarts.init(
        document.getElementById('rankName'),
        'dark'
      )
      const options = {
        title: {
          text: '名次表',
          textStyle: {
            fontSize: '14px',
            lineHeight: 30
          }
        },
        grid: {
          bottom: 35
        },
        legend: {
          show: false,
          left: '70px',
          // selectedMode: 'single',
          selected: selected
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
          data: xAxisData
        },
        yAxis: {
          name: '名次',
          type: 'value',
          nameTextStyle: {
            padding: [0, 50, 5, 0]
          }
        },
        series: series
      }
      this.echartsRankName.setOption(options)
    }
  }
}
</script>

<style lang="scss" scoped>
.scoreTemplate {
  .btns {
    display: flex;
    padding: 10px;
    .left {
      display: flex;
      flex: 1;
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
    // background: #fff;
  }
}
</style>
