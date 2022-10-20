<template>
  <el-dialog
    class="sort-dialog"
    :visible.sync="dialogVisible"
    :title="`${title}分析`"
    @close="onClose"
  >
    <table class="table" border>
      <tr>
        <th width="100px">{{ title }}</th>
        <th>班级</th>
      </tr>
      <tr>
        <td>90-99</td>
        <td>{{ sortObj.score90to99Num }}</td>
      </tr>
      <tr>
        <td>80-89</td>
        <td>{{ sortObj.score80to89Num }}</td>
      </tr>
      <tr>
        <td>70-79</td>
        <td>{{ sortObj.score70to79Num }}</td>
      </tr>
      <tr>
        <td>60-69</td>
        <td>{{ sortObj.score60to69Num }}</td>
      </tr>
      <tr>
        <td>50-59</td>
        <td>{{ sortObj.score50to59Num }}</td>
      </tr>
      <tr>
        <td>40-49</td>
        <td>{{ sortObj.score40to49Num }}</td>
      </tr>
      <tr>
        <td>30-39</td>
        <td>{{ sortObj.score30to39Num }}</td>
      </tr>
      <tr>
        <td>20-29</td>
        <td>{{ sortObj.score20to29Num }}</td>
      </tr>
      <tr>
        <td>10-19</td>
        <td>{{ sortObj.score10to19Num }}</td>
      </tr>
      <tr>
        <td>1-9</td>
        <td>{{ sortObj.score0to9Num }}</td>
      </tr>
      <tr>
        <td>最高分</td>
        <td>{{ sortObj.maxScore.name }}：{{ sortObj.maxScore.score }}</td>
      </tr>
      <tr>
        <td>最低分</td>
        <td>{{ sortObj.minScore.name }}：{{ sortObj.minScore.score }}</td>
      </tr>
      <tr>
        <td>不及格数</td>
        <td>{{ sortObj.noPassNum }}</td>
      </tr>
      <tr>
        <td>及格数</td>
        <td>
          {{ sortObj.passNum }}
        </td>
      </tr>
      <tr>
        <td>及格率%</td>
        <td>{{ sortObj.passRate }}</td>
      </tr>
      <tr>
        <td>优秀数</td>
        <td>{{ sortObj.excellentNum }}</td>
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
        <td>{{ sortObj.top10Num }}</td>
      </tr>
      <tr>
        <td>前50名数</td>
        <td>{{ sortObj.top50Num }}</td>
      </tr>
      <tr>
        <td>前100名数</td>
        <td>{{ sortObj.top100Num }}</td>
      </tr>
      <tr>
        <td>前150名数</td>
        <td>{{ sortObj.top150Num }}</td>
      </tr>
      <tr>
        <td>前200名数</td>
        <td>{{ sortObj.top200Num }}</td>
      </tr>
      <tr>
        <td>前250名数</td>
        <td>{{ sortObj.top250Num }}</td>
      </tr>
      <tr>
        <td>前300名数</td>
        <td>{{ sortObj.top300Num }}</td>
      </tr>
      <tr>
        <td>前350名数</td>
        <td>{{ sortObj.top350Num }}</td>
      </tr>
      <tr>
        <td>前400名数</td>
        <td>{{ sortObj.top400Num }}</td>
      </tr>
      <tr>
        <td>400名后人数</td>
        <td>{{ sortObj.otherTopNum }}</td>
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
    <span slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="exportExcel">导出</el-button>
    </span>
  </el-dialog>
</template>
<script>
import $ from 'jquery'
import * as XLSX from 'xlsx/xlsx.mjs'
const subjectMap = {
  1: {
    title: '语文',
    scoreKey: '语文',
    rankKey: '语名'
  },
  2: {
    title: '数学',
    scoreKey: '数学',
    rankKey: '数名'
  },
  3: {
    title: '英语',
    scoreKey: '英语',
    rankKey: '英名'
  },
  4: {
    title: '物理',
    scoreKey: '物理',
    rankKey: '物名'
  },
  5: {
    title: '化学',
    scoreKey: '化学',
    rankKey: '化名'
  },
  6: {
    title: '政治',
    scoreKey: '政治',
    rankKey: '政名'
  },
  7: {
    title: '历史',
    scoreKey: '历史',
    rankKey: '历名'
  }
}
export default {
  name: 'SortDialog',
  components: {},
  mixins: [],
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
  data() {
    return {
      title: '',
      dialogVisible: false,
      sortObj: {}
    }
  },
  created() {
    this.dialogVisible = true
    this.init()
  },
  mounted() {},
  methods: {
    init() {
      let config = subjectMap[this.subjectType]
      let scoreList = this.curTable.sortObj[config.scoreKey]
      let rankList = this.curTable.sortObj[config.rankKey]
      this.title = `${config.title}`
      this.singleSubjectSort(scoreList, rankList)
    },
    singleSubjectSort(list, rankList) {
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
        if (item.score >= 60) {
          sortObj.pass.push(item)
        } else {
          sortObj.noPass.push(item)
        }
        // 优秀
        if (item.score >= 85) {
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
    },
    // 获取分段人数
    getScoreRange(item, obj) {
      let fromNum = parseInt(item.score / 10) * 10
      if (fromNum == 10) fromNum = 9
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
        _item['班级'] = item.childNodes[1].textContent
        data.push(_item)
      })
      const book = XLSX.utils.book_new()
      const sheet = XLSX.utils.json_to_sheet(data)
      XLSX.utils.book_append_sheet(book, sheet)
      XLSX.writeFile(book, `${this.title}分析表.xls`)
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
  }
}
</style>
