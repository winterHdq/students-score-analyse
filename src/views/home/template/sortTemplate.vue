<template>
  <div class="sortTemplate">
    <el-tabs v-model="subjectName" type="card" @tab-click="handleClick">
      <el-tab-pane
        v-for="item in subjectList"
        :key="item"
        :label="item"
        :name="item"
      ></el-tab-pane>
    </el-tabs>
    <div class="btns">
      <el-button type="primary" class="btn" @click="onExport">导出</el-button>
      <el-button type="danger" class="btn" @click="onAddTable" v-if="isDialog">
        添加到列表
      </el-button>
      <el-radio-group v-model="radio" @change="typeChangeHandle">
        <el-radio-button :label="1">表格</el-radio-button>
        <el-radio-button :label="2">图表</el-radio-button>
      </el-radio-group>
    </div>
    <div v-if="sortObj">
      <el-table
        :data="sortList"
        border
        :height="tableHeight"
        v-show="radio == 1"
      >
        <el-table-column
          :label="subjectName"
          prop="label"
          width="100"
          align="center"
        ></el-table-column>
        <el-table-column #default="{ row }" :label="baseTable.className">
          {{ sortObj[row.key] }}
          <span v-if="isShowName && row.listKey">
            ：{{ sortObj[row.listKey] | toList }}
          </span>
        </el-table-column>
      </el-table>
      <div v-if="radio == 2">
        <div
          style="width: auto; height: 270px"
          id="sortScoreName"
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
    <div v-else class="tip">未找到【{{ subjectName }}】数据</div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import baseMixin from '../base/baseMixin'
import { delectnNoFindTable } from '@/common/utils'
export default {
  name: 'sortTemplate',
  mixins: [baseMixin],
  props: {
    tableId: {
      type: Number,
      require: true
    },
    tableHeight: {
      type: Number,
      default: 450
    },
    isDialog: {
      type: Boolean,
      default: false
    },
    // 是否年段分析
    isTotal: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState({
      tables: state => state.tables,
      isShowMenu: state => state.isShowMenu
    }),
    ...mapGetters(['subjectList', 'subjectObj', 'curIndex'])
  },
  watch: {
    isShowMenu() {
      this.echartsResize()
    }
  },
  data() {
    return {
      radio: 1,
      subConfig: {},
      is150: false,
      subjectName: '',
      baseTable: [],
      sortList: {},
      scoreRegionList: [],
      otherList: [
        {
          label: '最高分',
          value: 0,
          key: 'maxScore',
          listKey: 'maxScoreList'
        },
        {
          label: '最低分',
          value: 0,
          key: 'minScore',
          listKey: 'minScoreList'
        },
        {
          label: '不及格数',
          value: 0,
          key: 'noPassNum',
          listKey: 'noPass'
        },
        {
          label: '及格数',
          value: 0,
          key: 'passNum',
          listKey: 'pass'
        },
        {
          label: '及格率%',
          value: 0,
          key: 'passRate'
        },
        {
          label: '优秀数',
          value: 0,
          key: 'excellentNum',
          listKey: 'excellent'
        },
        {
          label: '优秀率%',
          value: 0,
          key: 'excellentRate'
        },
        {
          label: '与考人数',
          value: 0,
          key: 'peopleNum'
        }
      ],
      rangRegionList: [],
      averageList: [
        {
          label: '平均分',
          value: 0,
          key: 'average'
        },
        {
          label: '均分人数',
          value: 0,
          key: 'averageNum',
          listKey: 'averageList'
        }
      ],
      sortObj: null,
      isTable: true,
      isShowName: false,
      echarts: {
        sortScoreName: null,
        scoreRegion: null,
        rangRegion: null,
        pass: null,
        excellent: null
      }
    }
  },
  filters: {
    toList(val) {
      if (!val) return
      if (Array.isArray(val)) {
        return val.map(item => item.name).join('、')
      } else {
        return val.name || ''
      }
    }
  },
  created() {
    this.subjectName = this.subjectList[0]
    this.getTables()
  },
  destroyed() {
    this.destroyedEchart()
  },
  methods: {
    getTables() {
      this.curIndex
      let res = this.tables.find(v => v.id == this.tableId)
      if (!res) {
        this.isTable = false
        delectnNoFindTable()
        return false
      } else {
        this.baseTable = res
      }
      this.getRowName()
    },
    getRowName() {
      if (!this.isTable) return false
      this.subConfig = this.subjectObj[this.subjectName]
      this.is150 = this.subConfig.fullScore == 150
      this.scoreRegionList = this.getScoreRegionList()
      this.rangRegionList = this.getRangRegionList()
      this.sortList = [
        ...this.scoreRegionList,
        ...this.otherList,
        ...this.rangRegionList,
        ...this.averageList
      ]
      this.init()
    },
    // 获取分数区间
    getScoreRegionList() {
      let scoreList = []
      for (let i = 14; i >= 0; i--) {
        let startScore = i * 10
        let endScore = startScore + 9
        scoreList.push({
          label: `${startScore}-${endScore}`,
          value: 0,
          key: `score${startScore}to${endScore}Num`,
          listKey: `score${startScore}to${endScore}`
        })
      }
      if (this.is150) {
        scoreList[0].label = '140-150'
      } else {
        scoreList.splice(0, 5)
        scoreList[0].label = '90-100'
      }
      return scoreList
    },
    // 获取排名区间
    getRangRegionList() {
      let rangList = [
        {
          label: '前10名',
          value: 0,
          key: 'top10Num',
          isAdd: true
        }
      ]
      for (let i = 50; i <= 400; i += 50) {
        rangList.push({
          label: `前${i}名`,
          value: 0,
          key: `top${i}Num`,
          listKey: `top${i}`,
          isAdd: true
        })
      }
      rangList.push({
        label: '400名后',
        value: 0,
        key: 'otherTopNum',
        listKey: 'otherTop'
      })
      return rangList
    },
    init() {
      this.sortObj = this.classDataHandle(this.baseTable)
      this.typeChangeHandle()
    },
    classDataHandle(table = this.baseTable) {
      const list = table.sortObj[this.subConfig.scoreKey]
      const rankList = table.sortObj[this.subConfig.rankKey]
      if (!list || !rankList) return null
      this.scoreList = list.sort((a, b) => {
        return b.score - a.score
      })
      let sortObj = {
        score0to9Num: 0,
        score10to19Num: 0,
        score20to29Num: 0,
        score30to39Num: 0,
        score40to49Num: 0,
        score50to59Num: 0,
        score60to69Num: 0,
        score70to79Num: 0,
        score80to89Num: 0,
        score90to99Num: 0,
        score100to109Num: 0,
        score110to119Num: 0,
        score120to129Num: 0,
        score130to139Num: 0,
        score140to149Num: 0,
        maxScore: 0, //最高分
        maxScoreList: [],
        minScore: 0, //最低分
        minScoreList: [],
        pass: [],
        passNum: 0, //及格数
        noPass: [],
        noPassNum: 0, // 不及格数
        passRate: 0, // 及格率
        excellent: [],
        excellentNum: 0, //优秀数
        excellentRate: 0, //优秀率
        peopleNum: list.length, //与考人数
        top10: [],
        top50: [],
        top100: [],
        top150: [],
        top200: [],
        top250: [],
        top300: [],
        top350: [],
        top400: [],
        otherTop: [],
        average: 0, //平均分
        averageList: [],
        averageNum: 0 //均分人数
      }
      let totalScore = 0
      let passScore = this.subConfig.fullScore * 0.6
      let excellentScore = this.subConfig.fullScore * 0.85
      list.forEach(item => {
        const score = isNaN(item.score) ? 0 : parseFloat(item.score)
        this.getScoreRange(item, sortObj)
        // 总分
        totalScore += score
        // 获得最高分
        if (score > sortObj.maxScore) {
          sortObj.maxScore = score
          sortObj.maxScoreList = [item]
        }
        // 获取最低分
        if (score < sortObj.minScore) {
          sortObj.minScore = score
          sortObj.minScoreList = [item]
        }
        // 及格
        if (score >= passScore) {
          sortObj.pass.push(item)
        } else {
          sortObj.noPass.push(item)
        }
        // 优秀
        if (score >= excellentScore) {
          sortObj.excellent.push(item)
        }
      })
      sortObj.passNum = sortObj.pass.length
      sortObj.noPassNum = sortObj.noPass.length
      sortObj.passRate = ((sortObj.passNum / sortObj.peopleNum) * 100).toFixed(
        2
      )
      sortObj.excellentNum = sortObj.excellent.length
      sortObj.excellentRate = (
        (sortObj.excellentNum / sortObj.peopleNum) *
        100
      ).toFixed(2)

      // 平均分
      sortObj.average = (totalScore / sortObj.peopleNum).toFixed(2)
      // 获取均分人数
      list.forEach(item => {
        if (item.score >= sortObj.average) {
          sortObj.averageList.push(item)
        }
      })
      sortObj.averageNum = sortObj.averageList.length

      // 排名
      rankList.forEach(item => {
        if (item.score > 0 && item.score <= 10) {
          sortObj.top10.push(item)
        } else if (item.score > 10 && item.score <= 50) {
          sortObj.top50.push(item)
        } else if (item.score > 50 && item.score <= 100) {
          sortObj.top100.push(item)
        } else if (item.score > 100 && item.score <= 150) {
          sortObj.top150.push(item)
        } else if (item.score > 150 && item.score <= 200) {
          sortObj.top200.push(item)
        } else if (item.score > 200 && item.score <= 250) {
          sortObj.top250.push(item)
        } else if (item.score > 250 && item.score <= 300) {
          sortObj.top300.push(item)
        } else if (item.score > 300 && item.score <= 350) {
          sortObj.top350.push(item)
        } else if (item.score > 350 && item.score <= 400) {
          sortObj.top400.push(item)
        } else {
          sortObj.otherTop.push(item)
        }
      })
      let scoreArr = [10, 50, 100, 150, 200, 250, 300, 350, 400]
      scoreArr.forEach((v, i) => {
        sortObj[`top${v}Num`] =
          sortObj[`top${v}`].length + (sortObj[`top${scoreArr[i - 1]}Num`] || 0)
      })
      sortObj.otherTopNum = sortObj.otherTop.length
      return sortObj
    },
    // 获取分段人数
    getScoreRange(item, obj) {
      let fromNum = parseInt(item.score / 10) * 10
      if (!this.is150 && fromNum == 10) fromNum = 9
      if (this.is150 && fromNum == 15) fromNum = 14
      let toNum = fromNum + 9
      if (!obj[`score${fromNum}to${toNum}`])
        obj[`score${fromNum}to${toNum}`] = []
      obj[`score${fromNum}to${toNum}`].push(item)
      obj[`score${fromNum}to${toNum}Num`] =
        obj[`score${fromNum}to${toNum}`].length
    },
    getTotalData(sortObj) {
      let obj = {
        score0to9Num: 0,
        score10to19Num: 0,
        score20to29Num: 0,
        score30to39Num: 0,
        score40to49Num: 0,
        score50to59Num: 0,
        score60to69Num: 0,
        score70to79Num: 0,
        score80to89Num: 0,
        score90to99Num: 0,
        score100to109Num: 0,
        score110to119Num: 0,
        score120to129Num: 0,
        score130to139Num: 0,
        score140to149Num: 0,
        passNum: 0, //及格数
        noPassNum: 0, // 不及格数
        passRate: 0, // 及格率
        excellentNum: 0, //优秀数
        excellentRate: 0, //优秀率
        peopleNum: 0, //与考人数
        top10Num: 0,
        top50Num: 0,
        top100Num: 0,
        top150Num: 0,
        top200Num: 0,
        top250Num: 0,
        top300Num: 0,
        top350Num: 0,
        top400Num: 0,
        otherTopNum: 0,
        average: 0, //平均分
        averageNum: 0 //均分人数
      }
      let classNum = 0,
        maxScore = 0,
        minScore = 0
      for (let c in sortObj) {
        classNum++
        for (let k in obj) {
          obj[k] += parseFloat(sortObj[c][k]) || 0
        }
        if (maxScore < sortObj[c].maxScore) {
          maxScore = sortObj[c].maxScore
        }
        if (minScore > sortObj[c].minScore) {
          minScore = sortObj[c].minScore
        }
      }
      obj.maxScore = maxScore
      obj.minScore = minScore
      ;['passRate', 'excellentRate', 'average'].forEach(k => {
        obj[k] = (obj[k] / classNum).toFixed(2)
      })
      sortObj.all = obj
    },
    handleClick() {
      this.getRowName()
    },
    onExport() {
      const table = this.tableHandle()
      this.baseExportExcel(table)
    },
    // 添加到列表
    onAddTable() {
      const table = {
        id: Date.now(),
        column: [],
        name: `${this.baseTable.name}-${this.isTotal ? '年段' : '科目'}分析表`,
        className: this.isTotal ? '年段' : this.baseTable.className,
        isCompare: false,
        template: 'sortTemplate',
        extend: {
          tableId: this.tableId
        }
      }
      this.$store.commit('addTable', table)
      this.$store.commit('setCurTableId', table.id)
      this.$emit('onAddTable')
    },
    tableHandle() {
      const data = []
      this.$el
        .getElementsByTagName('table')[1]
        .childNodes[1].childNodes.forEach(item => {
          if (item.tagName !== 'TR') return
          let _item = {}
          let textContent = item.childNodes[0].textContent
          if (textContent == this.subjectName) return
          _item[this.subjectName] = textContent
          _item[this.baseTable.className] =
            item.childNodes[1].textContent.trim()
          data.push(_item)
        })
      const table = {
        id: Date.now(),
        column: Object.keys(data[0]),
        data: data,
        name: `${this.baseTable.name}-${this.subjectName}-科目分析表`,
        className: this.isTotal ? '年段' : this.baseTable.className,
        isCompare: false,
        template: 'sortTemplate'
      }
      return table
    },
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
      if (!this.sortObj) {
        this.destroyedEchart()
        return
      }
      this.radio == 1 ? this.destroyedEchart() : this.echartInit()
    },
    // 分数折线表
    echartsScoreNameInit() {
      this.echarts.sortScoreName = this.$echarts.init(
        document.getElementById('sortScoreName')
      )
      const _this = this
      const options = {
        title: {
          text: '成绩排序表'
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
          data: this.scoreList.map(item => item.name),
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
            data: this.scoreList.map(item => item.score),
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
      this.echarts.sortScoreName.setOption(options)
    },
    // 分数段柱状图
    echartsScoreRegionInit() {
      this.echarts.scoreRegion = this.$echarts.init(
        document.getElementById('scoreRegion')
      )
      const options = {
        title: {
          text: '成绩分析表'
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
          data: this.scoreRegionList.map(item => item.label),
          axisLabel: { interval: 0, rotate: 20 }
        },
        yAxis: {
          name: '人数',
          type: 'value'
        },
        series: [
          {
            name: '人数',
            data: this.scoreRegionList.map(item => this.sortObj[item.key]),
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
      this.echarts.scoreRegion.setOption(options)
    },
    // 名次段柱状图
    echartsRangRegionInit() {
      this.echarts.rangRegion = this.$echarts.init(
        document.getElementById('rangRegion')
      )
      const options = {
        title: {
          text: '名次分析表'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          name: '名次',
          type: 'category',
          data: this.rangRegionList.map(item => item.label),
          axisLabel: { interval: 0, rotate: 0 }
        },
        yAxis: {
          name: '人数',
          type: 'value'
        },
        series: [
          {
            name: '人数',
            data: this.rangRegionList.map(item => this.sortObj[item.key]),
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
      this.echarts.rangRegion.setOption(options)
    },
    // 及格率
    echartsPassInit() {
      this.echarts.pass = this.$echarts.init(document.getElementById('pass'))
      let options = {
        title: {
          text: '及格率'
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
              { value: this.sortObj.passNum, name: '及格数' },
              { value: this.sortObj.noPassNum, name: '不及格数' }
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
      this.echarts.pass.setOption(options)
    },
    // 优秀率
    echartsexcellentInit() {
      this.echarts.excellent = this.$echarts.init(
        document.getElementById('excellent')
      )
      const options = {
        title: {
          text: '优秀率'
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
              { value: this.sortObj.excellentNum, name: '优秀数' },
              {
                value: this.sortObj.peopleNum - this.sortObj.excellentNum,
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
            const val =
              name == '优秀数'
                ? options.series[0].data[0].value
                : options.series[0].data[1].value
            return `${name}：${val}`
          }
        }
      }
      this.echarts.excellent.setOption(options)
    },
    // 注销
    destroyedEchart() {
      for (let k in this.echarts) {
        this.echarts[k] && this.echarts[k].dispose()
      }
    },
    echartsResize() {
      setTimeout(() => {
        for (let k in this.echarts) {
          this.echarts[k] && this.echarts[k].resize()
        }
      }, 500)
    }
  }
}
</script>

<style lang="scss" scoped>
.sortTemplate {
  position: relative;
  .btns {
    position: absolute;
    top: 0;
    right: 5px;
    .btn {
      margin-right: 5px;
    }
  }
  .tip {
    text-align: center;
    line-height: 60px;
    color: red;
    font-size: 16px;
  }
  .echartitem {
    border: 1px solid #e5e7eb;
    box-shadow: rgb(10 9 9 / 10%) 0px 0px 5px;
    margin: 5px;
    border-radius: 5px;
    background: #fff;
  }
  ::v-deep {
    .el-tabs__header {
      margin: 13px 10px -1px;
    }
    .el-tabs__item {
      color: #409eff;
      :hover {
        color: #ff4545;
      }
    }
    .el-tabs__item.is-active {
      color: #ff4545;
    }
  }
}
</style>
