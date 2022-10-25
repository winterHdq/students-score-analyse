<template>
  <el-dialog
    v-if="dialogVisible"
    class="sort-dialog"
    :visible.sync="dialogVisible"
    :title="`${title}排位`"
    width="80%"
    @close="onClose"
    v-loading="loading"
    element-loading-text="正在拼命计算中，请小主耐心等待"
  >
    <el-button type="danger" @click="isShowName = !isShowName">
      {{ isShowName ? '隐藏' : '显示' }}姓名
    </el-button>
    <el-button type="primary" @click="exportExcel">导出</el-button>
    <table class="table" border>
      <tr>
        <th width="120px">{{ title }}</th>
        <th>班级</th>
      </tr>
      <tr v-if="is150">
        <td>140-150</td>
        <td>
          {{ sortObj.score140to149Num }}
          <span v-if="isShowName">：{{ sortObj.score140to149 | toList }}</span>
        </td>
      </tr>
      <tr v-if="is150">
        <td>130-139</td>
        <td>
          {{ sortObj.score130to139Num }}
          <span v-if="isShowName">：{{ sortObj.score130to139 | toList }}</span>
        </td>
      </tr>
      <tr v-if="is150">
        <td>120-129</td>
        <td>
          {{ sortObj.score120to129Num }}
          <span v-if="isShowName">：{{ sortObj.score120to129 | toList }}</span>
        </td>
      </tr>
      <tr v-if="is150">
        <td>110-119</td>
        <td>
          {{ sortObj.score110to119Num }}
          <span v-if="isShowName">：{{ sortObj.score110to119 | toList }}</span>
        </td>
      </tr>
      <tr v-if="is150">
        <td>100-109</td>
        <td>
          {{ sortObj.score100to109Num }}
          <span v-if="isShowName">：{{ sortObj.score100to109 | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>90-99</td>
        <td>
          {{ sortObj.score90to99Num }}
          <span v-if="isShowName">：{{ sortObj.score90to99 | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>80-89</td>
        <td>
          {{ sortObj.score80to89Num }}
          <span v-if="isShowName">：{{ sortObj.score80to89 | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>70-79</td>
        <td>
          {{ sortObj.score70to79Num }}
          <span v-if="isShowName">：{{ sortObj.score70to79 | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>60-69</td>
        <td>
          {{ sortObj.score60to69Num }}
          <span v-if="isShowName">：{{ sortObj.score60to69 | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>50-59</td>
        <td>
          {{ sortObj.score50to59Num }}
          <span v-if="isShowName">：{{ sortObj.score50to59 | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>40-49</td>
        <td>
          {{ sortObj.score40to49Num }}
          <span v-if="isShowName">：{{ sortObj.score40to49 | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>30-39</td>
        <td>
          {{ sortObj.score30to39Num }}
          <span v-if="isShowName">：{{ sortObj.score30to39 | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>20-29</td>
        <td>
          {{ sortObj.score20to29Num }}
          <span v-if="isShowName">：{{ sortObj.score20to29 | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>10-19</td>
        <td>
          {{ sortObj.score10to19Num }}
          <span v-if="isShowName">：{{ sortObj.score10to19 | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>0-9</td>
        <td>
          {{ sortObj.score0to9Num }}
          <span v-if="isShowName">：{{ sortObj.score0to9 | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>最高分</td>
        <td>{{ sortObj.maxScore.score }}</td>
      </tr>
      <tr>
        <td>最低分</td>
        <td>{{ sortObj.minScore.score }}</td>
      </tr>
      <tr>
        <td>不及格数</td>
        <td>
          {{ sortObj.noPassNum }}
          <span v-if="isShowName">：{{ sortObj.noPass | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>及格数</td>
        <td>
          {{ sortObj.passNum }}
          <span v-if="isShowName">：{{ sortObj.pass | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>及格率%</td>
        <td>{{ sortObj.passRate }}</td>
      </tr>
      <tr>
        <td>优秀数</td>
        <td>
          {{ sortObj.excellentNum }}
          <span v-if="isShowName">：{{ sortObj.excellent | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>优秀率%</td>
        <td>{{ sortObj.excellentRate }}</td>
      </tr>
      <tr>
        <td>与考人数</td>
        <td>{{ sortObj.peopleNum }}</td>
      </tr>
      <tr>
        <td>前10名数</td>
        <td>
          {{ sortObj.top10Num }}
          <span v-if="isShowName">：{{ sortObj.top10 | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>前50名数</td>
        <td>
          {{ sortObj.top50Num }}
          <span v-if="isShowName">：{{ sortObj.top50 | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>前100名数</td>
        <td>
          {{ sortObj.top100Num }}
          <span v-if="isShowName">：{{ sortObj.top100 | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>前150名数</td>
        <td>
          {{ sortObj.top150Num }}
          <span v-if="isShowName">：{{ sortObj.top150 | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>前200名数</td>
        <td>
          {{ sortObj.top200Num }}
          <span v-if="isShowName">：{{ sortObj.top200 | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>前250名数</td>
        <td>
          {{ sortObj.top250Num }}
          <span v-if="isShowName">：{{ sortObj.top250 | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>前300名数</td>
        <td>
          {{ sortObj.top300Num }}
          <span v-if="isShowName">：{{ sortObj.top300 | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>前350名数</td>
        <td>
          {{ sortObj.top350Num }}
          <span v-if="isShowName">：{{ sortObj.top350 | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>前400名数</td>
        <td>
          {{ sortObj.top400Num }}
          <span v-if="isShowName">：{{ sortObj.top400 | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>400名后人数</td>
        <td>
          {{ sortObj.otherTopNum }}
          <span v-if="isShowName">：{{ sortObj.otherTop | toList }}</span>
        </td>
      </tr>
      <tr>
        <td>平均分</td>
        <td>{{ sortObj.average }}</td>
      </tr>
      <tr>
        <td>均分人数</td>
        <td>{{ sortObj.averageNum }}</td>
      </tr>
    </table>
    <!-- <span slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
    </span> -->
  </el-dialog>
</template>
<script>
import $ from 'jquery'
import baseMixin from './base/baseMixin'
export default {
  name: 'SortDialog',
  components: {},
  mixins: [baseMixin],
  props: {
    subjectType: {
      type: Number,
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
    toList(arr) {
      return (arr || []).map(item => item.name).join('、')
    }
  },
  data() {
    return {
      title: '',
      dialogVisible: false,
      sortObj: {},
      config: {},
      loading: false,
      isShowName: false
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
    this.init()
  },
  methods: {
    init() {
      this.config = this.subjectMap[this.subjectType - 1]
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
      this.dialogVisible = true
      this.loading = true
      // list = list.sort((a, b) => {
      //   return a.score - b.score
      // })
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
        maxScore: list[0], //最高分
        minScore: list[0], //最低分
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
      let passScore = this.config.fullScore * 0.6
      let excellentScore = this.config.fullScore * 0.85
      list.forEach(item => {
        this.getScoreRange(item, sortObj)
        // 总分
        totalScore += item.score
        // 获得最高分
        if (item.score > sortObj.maxScore.score) {
          sortObj.maxScore = item
        }
        // 获取最低分
        if (item.score < sortObj.minScore.score) {
          sortObj.minScore = item
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
      obj[`score${fromNum}to${toNum}Num`] =
        obj[`score${fromNum}to${toNum}`].length
    },
    // 导出
    exportExcel() {
      let data = []
      $('.table')[0].childNodes.forEach(item => {
        let _item = {}
        let textContent = item.childNodes[0].textContent
        if (textContent == this.title) return
        _item[this.title] = textContent
        _item['班级'] = item.childNodes[1].textContent.trim()
        data.push(_item)
      })
      const table = {
        id: Date.now(),
        column: Object.keys(data),
        data: data,
        name: `${this.title}分析表.xls`
      }
      this.baseExportExcel(table)
      // const book = XLSX.utils.book_new()
      // const sheet = XLSX.utils.json_to_sheet(data)
      // XLSX.utils.book_append_sheet(book, sheet)
      // XLSX.writeFile(book, `${this.title}分析表.xls`)
    },
    onClose() {
      this.$emit('onClose')
    }
  }
}
</script>

<style lang="scss" scoped>
.sort-dialog {
  .table {
    width: 100%;
    max-width: 100%;
    background-color: transparent;
    border-collapse: collapse;
    border-spacing: 0;
    tr {
      th,
      td {
        padding: 2px 10px;
      }
      td:first-child {
        text-align: center;
      }
    }
  }
}
</style>
