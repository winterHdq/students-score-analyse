<template>
  <div class="scoreTemplate">
    <div class="btns">
      <div class="left">
        <base-class-setting
          ref="setting"
          v-model="curTable.className"
        ></base-class-setting>
        <template v-if="curTable.sortObj">
          <!-- <el-button
            type="success"
            plain
            @click="onSubjectCompare"
            v-if="!curTable.isSingleCompare"
          >
            单科比较
          </el-button> -->
        </template>
      </div>
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
    <div style="padding: 5px" v-if="radio == 1 && curTable.sortObj">
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
    </div>
    <div v-if="radio == 2">
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
      <div style="display: flex">
        <div
          style="width: 50%; height: 270px"
          id="scoreName"
          class="echartitem"
        ></div>
        <div
          style="width: 50%; height: 270px"
          id="rankName"
          class="echartitem"
        ></div>
      </div>
      <div
        v-if="isCompare"
        style="width: auto; height: 250px"
        id="compare"
        class="echartitem"
      ></div>
    </div>
    <base-table
      v-else
      ref="baseTable"
      :table-height="tableHeight - 40"
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
import BaseExportBtn from '../base/baseExportBtn'
// import baseMixin from '../base/baseMixin'
export default {
  name: 'ScoreTemplate',
  components: {
    BaseClassSetting,
    BaseTable,
    SortDialog,
    BaseExportBtn
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
    isCompare() {
      return this.curTable.isCompare
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
      xAxisRankData.push('段名')
      this.xAxisData = xAxisData
      this.xAxisRankData = xAxisRankData
      if (this.isCompare) {
        this.compareInitHandle()
      }
    },
    // 比较初始化
    compareInitHandle() {
      ;(this.curTable?.extend?.preTable.data || []).forEach(item => {
        this.preNameListObj[item['姓名']] = item
      })
    },
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
      this.echartsRankName.setOption({
        series: series.rank
      })
      if (this.isCompare) {
        const { series } = this.getCompaseConfig()
        this.echartsCompare.setOption({
          series: series
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
          name: this.curTable.name,
          type: 'line',
          label: {
            show: true
          },
          data: []
        }
        let rankItem = {
          name: this.curTable.name,
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
          data: this.xAxisRankData
        },
        yAxis: {
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
    getCompaseConfig() {
      let preTable = this.curTable.extend.preTable
      let series = [
        {
          name: this.curTable.name,
          type: 'line',
          label: {
            show: true
          },
          data: []
        },
        {
          name: preTable.name,
          type: 'line',
          label: {
            show: true
          },
          data: []
        }
      ]
      let xAxis = this.curTable.extend.compareColumn
      const name = this.nameCheck[0]
      let curItem = this.nameListObj[name]
      let preItem = this.preNameListObj[name]
      xAxis.forEach(key => {
        curItem && series[0].data.push(curItem[key])
        preItem && series[1].data.push(preItem[key])
      })
      return {
        series,
        xAxis
      }
    },
    echartsCompareInit() {
      if (!this.isCompare) return
      let { xAxis, series } = this.getCompaseConfig()
      this.echartsCompare = this.$echarts.init(
        document.getElementById('compare')
      )
      const options = {
        title: {
          text: '比较表',
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
          name: '比较',
          type: 'category',
          position: 'top',
          data: xAxis
        },
        yAxis: {
          type: 'value',
          inverse: true, //反转坐标轴
          nameTextStyle: {
            padding: [0, 50, 5, 0]
          }
        },
        series: series
      }
      this.echartsCompare.setOption(options)
    },
    onSubjectCompare() {
      let tableData = []
      this.curTable.data.forEach(item => {
        let _item = {}
        let zsmData = item['折算名']
        for (let k in item) {
          _item[k] = item[k]
          if (zsmData && this.subjectRankList.includes(k)) {
            _item[`${k}差值`] = zsmData - item[k]
          }
        }
        tableData.push(_item)
      })
      let _index = null
      this.tables.find((item, index) => {
        if (item.id == this.curTable.id) {
          _index = index
          return true
        }
      })
      this.tables[_index] = {
        ...this.tables[_index],
        isSingleCompare: true,
        data: tableData,
        column: Object.keys(tableData[0]),
        id: Date.now()
      }
      this.$store.commit('setTables', this.tables)
      this.$store.commit('setCurTableId', this.tables[_index].id)
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
      flex: 1;
    }
    .right {
      margin: 0 auto;
    }
  }
  .nameCheck {
    padding: 10px 20px;
  }
  .echartitem {
    border: 1px solid #e5e7eb;
    box-shadow: rgb(10 9 9 / 10%) 0px 0px 5px;
    margin: 5px;
    border-radius: 5px;
    background: #fff;
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
