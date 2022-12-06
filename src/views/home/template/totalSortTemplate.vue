<template>
  <div class="totalSortTemplate">
    <el-tabs v-model="subjectName" type="card" @tab-click="handleClick">
      <el-tab-pane
        v-for="item in subjectList"
        :key="item"
        :label="item"
        :name="item"
      ></el-tab-pane>
      <el-tab-pane
        v-for="item in totalMap"
        :key="item.key"
        :label="item.name"
        :name="item.name"
      ></el-tab-pane>
    </el-tabs>
    <div class="btns">
      <el-button type="primary" @click="onExport">导出</el-button>
      <el-button type="danger" @click="onAddTable" v-if="isDialog">
        添加到列表
      </el-button>
    </div>
    <el-table :data="scoreTable" border :height="tableHeight" v-if="dataObj">
      <el-table-column
        :label="subjectName"
        prop="label"
        width="100"
        align="center"
      ></el-table-column>
      <el-table-column label="年段" #default="{ row }" align="center">
        {{ dataObj.all[row.key] }}
      </el-table-column>
      <template v-for="table in classTables">
        <el-table-column
          :key="table.id"
          #default="{ row }"
          :label="table.className"
          align="center"
        >
          {{ dataObj[table.className][row.key] }}
        </el-table-column>
      </template>
    </el-table>
  </div>
</template>

<script>
import baseMixin from '../base/baseMixin'
import { mapState, mapGetters } from 'vuex'
import { delectnNoFindTable } from '@/common/utils'
export default {
  name: 'TotalSortTemplate',
  mixins: [baseMixin],
  props: {
    classes: {
      type: Array,
      default() {
        return []
      }
    },
    tableName: {
      type: String,
      default: '年段分析'
    },
    tableHeight: {
      type: Number,
      default: 450
    },
    isDialog: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    curTableId: {
      handler() {
        this.subjectName = this.subjectList[0]
        this.getTables()
      },
      immediate: true
    }
    // isShowMenu() {
    //   this.echartsResize()
    // }
  },
  computed: {
    ...mapState({
      tables: state => state.tables,
      isShowMenu: state => state.isShowMenu,
      totalMap: state => state.totalMap,
      curTableId: state => state.curTableId
    }),
    ...mapGetters(['subjectList', 'subjectObj']),
    totalList() {
      return this.totalMap.map(item => item.name)
    }
  },
  data() {
    return {
      subConfig: {},
      is150: false,
      classTables: [],
      subjectName: '',
      scoreTable: {},
      scoreRegionList: [],
      otherList: [
        {
          label: '最高分',
          value: 0,
          key: 'maxScore',
          isName: true,
          isTotal: true
        },
        {
          label: '最低分',
          value: 0,
          key: 'minScore',
          isName: true,
          isTotal: true
        },
        {
          label: '不及格数',
          value: 0,
          key: 'noPassNum',
          isName: true
        },
        {
          label: '及格数',
          value: 0,
          key: 'passNum',
          isName: true
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
          isName: true
        },
        {
          label: '优秀率%',
          value: 0,
          key: 'excellentRate'
        },
        {
          label: '与考人数',
          value: 0,
          key: 'peopleNum',
          isTotal: true
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
          isName: true
        }
      ],
      dataObj: null,
      isTable: true
    }
  },
  methods: {
    getTables() {
      let classTables = []
      this.classes.forEach(id => {
        let res = this.tables.find(v => v.id == id)
        if (!res) {
          this.isTable = false
        } else {
          classTables.push(res)
        }
      })
      if (!this.isTable) {
        delectnNoFindTable()
        return false
      }
      this.classTables = classTables
      this.getRowName()
    },
    getRowName() {
      if (!this.isTable) return false
      if (this.totalList.includes(this.subjectName)) {
        this.subConfig = this.totalMap.filter(
          item => item.name === this.subjectName
        )[0]
        let rangRegionList = this.getRangRegionList()
        this.scoreTable = [
          ...this.otherList.filter(item => item.isTotal),
          ...rangRegionList,
          ...this.averageList
        ]
      } else {
        this.subConfig = this.subjectObj[this.subjectName]
        this.is150 = this.subConfig.fullScore == 150
        let scoreRegionList = this.getScoreRegionList()
        let rangRegionList = this.getRangRegionList()
        this.scoreTable = [
          ...scoreRegionList,
          ...this.otherList,
          ...rangRegionList,
          ...this.averageList
        ]
      }
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
          isName: true
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
          isAdd: true,
          isName: true
        }
      ]
      for (let i = 50; i <= 400; i += 50) {
        rangList.push({
          label: `前${i}名`,
          value: 0,
          key: `top${i}Num`,
          isAdd: true,
          isName: true
        })
      }
      rangList.push({
        label: '400名后',
        value: 0,
        key: 'otherTopNum',
        isName: true
      })
      return rangList
    },
    init() {
      let dataObj = {}
      this.classTables.forEach(item => {
        dataObj[item.className] = this.classDataHandle(item)
      })
      this.getTotalData(dataObj)
      this.dataObj = dataObj
    },
    classDataHandle(table) {
      const list = table.sortObj[this.subConfig.scoreKey]
      const rankList = table.sortObj[this.subConfig.rankKey]
      if (!list || !rankList) {
        return {}
      }
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
        minScore: 0, //最低分
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
        this.getScoreRange(item, sortObj)
        // 总分
        totalScore += item.score
        // 获得最高分
        if (item.score > sortObj.maxScore) {
          sortObj.maxScore = item.score
        }
        // 获取最低分
        if (item.score < sortObj.minScore) {
          sortObj.minScore = item.score
        }
        // 及格
        if (item.score >= passScore) {
          sortObj.pass.push(item)
        } else {
          sortObj.noPass.push(item)
        }
        // 优秀
        if (item.score >= excellentScore) {
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
    getTotalData(dataObj) {
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
      for (let c in dataObj) {
        classNum++
        for (let k in obj) {
          obj[k] += parseFloat(dataObj[c][k]) || 0
        }
        if (maxScore < dataObj[c].maxScore) {
          maxScore = dataObj[c].maxScore
        }
        if (minScore > dataObj[c].minScore) {
          minScore = dataObj[c].minScore
        }
      }
      obj.maxScore = maxScore
      obj.minScore = minScore
      ;['passRate', 'excellentRate', 'average'].forEach(k => {
        obj[k] = (obj[k] / classNum).toFixed(2)
      })
      dataObj.all = obj
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
        name: this.tableName,
        className: '年段',
        isCompare: false,
        column: [],
        template: 'totalSortTemplate',
        extend: {
          classes: this.classes
        }
      }
      this.$store.commit('addTable', table)
      this.$store.commit('setCurTableId', table.id)
      this.$emit('onAddTable')
    },
    tableHandle() {
      const data = []
      const classNameList = this.classTables.map(item => item.className)
      this.$el
        .getElementsByTagName('table')[1]
        .childNodes[1].childNodes.forEach(item => {
          if (item.tagName !== 'TR') return
          let _item = {}
          let textContent = item.childNodes[0].textContent
          if (textContent == this.subjectName) return
          _item[this.subjectName] = textContent
          _item['年段'] = item.childNodes[1].textContent.trim()
          classNameList.forEach((c, index) => {
            _item[c] = item.childNodes[index + 2].textContent.trim()
          })
          data.push(_item)
        })
      const table = {
        id: Date.now(),
        column: Object.keys(data[0]),
        data: data,
        name: `${this.tableName}-${this.subjectName}`,
        className: '年段',
        isCompare: false,
        template: 'totalSortTemplate',
        extend: {
          classes: this.classes
        }
      }
      return table
    }
  }
}
</script>

<style lang="scss" scoped>
.totalSortTemplate {
  position: relative;
  .btns {
    position: absolute;
    top: 0;
    right: 0;
  }
  ::v-deep {
    .el-tabs__header {
      margin: 6px 10px -1px;
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
