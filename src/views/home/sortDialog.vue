<template>
  <el-dialog
    v-if="dialogVisible"
    class="sort-dialog"
    :visible.sync="dialogVisible"
    :title="`${title}排位`"
    width="80%"
    top="5vh"
    @close="onClose"
    v-loading="loading"
    element-loading-text="正在拼命计算中，请小主耐心等待"
  >
    <sort-template
      :curTable="curTable"
      :scoreTable="scoreTable"
      :sortObj="sortObj"
      :subjects="title"
      :extendData="{
        scoreList,
        scoreRegionList,
        rangRegionList
      }"
      @onAddTable="onClose"
    ></sort-template>
  </el-dialog>
</template>
<script>
import baseMixin from './base/baseMixin'
import SortTemplate from './template/sortTemplate.vue'
export default {
  name: 'SortDialog',
  components: { SortTemplate },
  mixins: [baseMixin],
  props: {
    subjectName: {
      type: String,
      required: true
    },
    curTable: {
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
  data() {
    return {
      title: '',
      dialogVisible: false,
      sortObj: {},
      config: {},
      loading: false,
      isShowName: false,
      scoreList: [], // 分数列表，由大到小排序
      scoreRegionList: [],
      otherList: [
        {
          label: '最高分',
          value: 0,
          key: 'maxScore',
          isName: true
        },
        {
          label: '最低分',
          value: 0,
          key: 'minScore',
          isName: true
        },
        {
          label: '不及格数',
          value: 0,
          key: 'pass',
          isName: true
        },
        {
          label: '及格数',
          value: 0,
          key: 'noPass',
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
          key: 'excellent',
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
          key: 'averageList',
          isName: true
        }
      ],
      // 分析列表
      scoreTable: []
    }
  },
  computed: {
    subjectMap() {
      return this.$store.state.subjectMap
    },
    subjectObj() {
      return this.$store.getters.subjectObj
    },
    is150() {
      return this.config.fullScore == 150
    }
  },
  created() {
    this.config = this.subjectObj[this.subjectName]
    this.scoreRegionList = this.getScoreRegionList()
    this.rangRegionList = this.getRangRegionList()
    this.init()
  },
  methods: {
    // 获取分数区间
    getScoreRegionList() {
      let scoreList = []
      for (let i = 14; i >= 0; i--) {
        let startScore = i * 10
        let endScore = startScore + 9
        scoreList.push({
          label: `${startScore}-${endScore}`,
          value: 0,
          key: `score${startScore}to${endScore}`,
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
          key: 'top10',
          isAdd: true,
          isName: true
        }
      ]
      for (let i = 50; i <= 400; i += 50) {
        rangList.push({
          label: `前${i}名`,
          value: 0,
          key: `top${i}`,
          isAdd: true,
          isName: true
        })
      }
      rangList.push({
        label: '400名后',
        value: 0,
        key: 'otherTop',
        isName: true
      })
      return rangList
    },
    init() {
      let scoreList = this.curTable.sortObj[this.config.scoreKey]
      let rankList = this.curTable.sortObj[this.config.rankKey]
      this.title = `${this.config.name}`
      this.singleSubjectSort(scoreList, rankList)
    },
    singleSubjectSort(list, rankList) {
      if (!list || !rankList) {
        this.$message.error('未查到该数据')
        this.onClose()
        return
      }
      const scoreTable = []
      this.dialogVisible = true
      this.loading = true
      this.scoreList = list.sort((a, b) => {
        return b.score - a.score
      })
      let sortObj = {
        maxScore: 0, //最高分
        minScore: 0, //最低分
        pass: [],
        noPass: [],
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
        averageList: []
      }
      let totalScore = 0
      let passScore = this.config.fullScore * 0.6
      let excellentScore = this.config.fullScore * 0.85
      // 最高分
      sortObj.maxScore = this.scoreList[0]
      // 最低分
      sortObj.minScore = this.scoreList[this.scoreList.length - 1]
      list.forEach(item => {
        this.getScoreRange(item, sortObj)
        // 总分
        totalScore += item.score
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
      // 及格率
      sortObj.passRate = (
        (sortObj.pass.length / sortObj.peopleNum) *
        100
      ).toFixed(2)
      // 优秀率
      sortObj.excellentRate = (
        (sortObj.excellent.length / sortObj.peopleNum) *
        100
      ).toFixed(2)

      this.scoreRegionList.forEach(item => {
        item.data = sortObj[item.key] || []
        item.value = item.data.length
        scoreTable.push(item)
      })
      this.otherList.forEach(item => {
        let val = sortObj[item.key]
        if (Array.isArray(val)) {
          item.data = val
          item.value = val.length
        } else if (val instanceof Object) {
          item.data = val
          item.value = val.score
        } else {
          item.value = val
        }
        scoreTable.push(item)
      })
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
      let topNum = 0
      this.rangRegionList.forEach(item => {
        item.data = sortObj[item.key] || []
        // 累加
        item.value = item.isAdd ? item.data.length + topNum : item.data.length
        topNum = item.value
        scoreTable.push(item)
      })

      // 平均分
      sortObj.average = (totalScore / sortObj.peopleNum).toFixed(2)
      // 获取均分人数
      list.forEach(item => {
        if (item.score >= sortObj.average) {
          sortObj.averageList.push(item)
        }
      })
      sortObj.averageNum = sortObj.averageList.length

      this.averageList.forEach(item => {
        const val = sortObj[item.key]
        if (Array.isArray(val)) {
          item.data = val
          item.value = val.length
        } else {
          item.value = sortObj[item.key]
        }
        scoreTable.push(item)
      })
      this.scoreTable = scoreTable
      this.sortObj = sortObj
      this.loading = false
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
    },
    tableHandle() {
      let data = []
      this.$el
        .getElementsByTagName('table')[1]
        .childNodes[1].childNodes.forEach(item => {
          if (item.tagName !== 'TR') return
          let _item = {}
          let textContent = item.childNodes[0].textContent
          if (textContent == this.title) return
          _item[this.title] = textContent
          _item[this.curTable.className] = item.childNodes[1].textContent.trim()
          data.push(_item)
        })
      const table = {
        id: Date.now(),
        column: Object.keys(data[0]),
        data: data,
        name: `${this.curTable.name}-${this.curTable.className}-${this.title}分析表`,
        className: this.curTable.className,
        isCompare: false
      }
      return table
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
      this.onClose()
    },
    onClose() {
      this.$emit('onClose')
    }
  }
}
</script>

<style lang="scss" scoped>
.sort-dialog {
}
</style>
