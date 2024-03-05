<template>
  <div class="baseTemplateBtn">
    <el-button
      type="success"
      size="small"
      plain
      @click="dialogVisiable = !dialogVisiable"
    >
      使用说明
    </el-button>
    <el-dialog
      title="使用说明"
      :visible.sync="dialogVisiable"
      width="80%"
      :close-on-click-modal="false"
    >
      <el-tabs v-model="activeName" style="margin-top: -30px">
        <el-tab-pane label="表格规范（重点）" name="rule">
          <div class="rules">
            <div>
              <h3 style="color: red">表格规则（重点）</h3>
              <p>1、【姓名】列必须存在；</p>
              <p>
                2、列名必须一致，但位置可变，可多可少。例如：姓名、语文、数学、总分、段名
              </p>
            </div>
            <div style="margin-left: auto">
              <el-button type="primary" @click="onExport">模版导出</el-button>
            </div>
          </div>
          <table class="table" border>
            <tr>
              <th v-for="item in table.column" :key="item">{{ item }}</th>
            </tr>
            <tr v-for="(i, index) in table.data" :key="index">
              <td v-for="item in table.column" :key="item" class="td">
                {{ i[item] }}
              </td>
            </tr>
          </table>
        </el-tab-pane>
        <el-tab-pane label="成绩分析" name="studentScore">
          <div class="content-wrap">
            <p class="title">
              用于分析学生多次成绩排名变化，如：比较初中三年成绩变化
            </p>
            <div class="card-item">
              <div class="img">
                <img :src="require('/src/assets/img/cjfx.png')" />
              </div>
              <div class="explain">
                <p>成绩分析</p>
                <ul class="explain-ul">
                  <li>
                    姓名查找：可通过表格上方姓名下拉筛选，可输入关键词查找
                  </li>
                  <li>修改按钮：去除/添加当前所要分析的表格</li>
                  <li>一键下载：批量下载所有学生的成绩情况</li>
                  <li>
                    下载设置：可设置下载表格里需要打印的列，下载图表里需要打印的科目
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="进退比较" name="comparison">
          <div class="content-wrap">
            <p class="title">
              用于比较两个表格之间的数据，如：比较当前考试与上一次考试的进退情况
            </p>
            <div class="card-item">
              <div class="img">
                <img :src="require('/src/assets/img/jtfx-chart.png')" />
              </div>
              <div class="explain">
                <p>进退比较</p>
                <ul class="explain-ul">
                  <li>分科导出：可按照科目导出所需科目数据</li>
                </ul>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="优劣分析" name="goodAndBad">
          <div class="content-wrap">
            <p class="title">用于分析当前考试优劣科目</p>
            <div class="card-item">
              <div class="img">
                <img :src="require('/src/assets/img/ylfx.png')" />
              </div>
              <div class="explain">
                <p>优劣分析</p>
                <ul class="explain-ul">
                  <li>差值（语差/数差等）：</li>
                  <ul>
                    <li>科目差值：折算名/段名 - 科目名</li>
                    <li>优势科目：科目差值 &gt; 50</li>
                    <li>劣势科目：科目差值 &lt; -50</li>
                  </ul>
                </ul>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="科目分析" name="subject">
          <div class="content-wrap">
            <p class="title">用于分析班级当前考试科目情况</p>
            <div class="card-item">
              <div class="img">
                <img :src="require('/src/assets/img/kmfx.png')" />
              </div>
              <div class="explain">
                <p>科目分析</p>
                <ul class="explain-ul">
                  <li>导出：下载当前分析表格</li>
                  <li>添加到列表：保存表格到列表，可直接查看</li>
                </ul>
              </div>
            </div>
            <div class="card-item">
              <div class="img">
                <img :src="require('/src/assets/img/kmfx-chart.png')" />
              </div>
              <div class="explain">
                <p>图表形式</p>
                <ul class="explain-ul">
                  <li>导出：下载当前分析表格</li>
                  <li>切换科目：点击图表头部标识，可切换展示不同科目情况</li>
                  <li>
                    切换图表：点击图表头部左侧功能，可切图表类型（柱状图、折线图）
                  </li>
                  <li>下载：点击图表头部保存为图片功能，可实现单图表下载</li>
                </ul>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="年段分析" name="allClasses">
          <div class="content-wrap">
            <p class="title">用于分析当前考试年段的数据</p>
            <div class="card-item">
              <div class="img">
                <img :src="require('/src/assets/img/ndfx.png')" />
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script>
const templateData = [
  {
    班级: 10,
    姓名: '小黄',
    语文: 129,
    语名: 59,
    数学: 142,
    数名: 30,
    英语: 142,
    英名: 39,
    物理: 93,
    物名: 56,
    化学: 90,
    化名: 60,
    生物: 96,
    生名: 14,
    政治: 89,
    政名: 71,
    历史: 92,
    历名: 103,
    地理: 91,
    地名: 95,
    总分: 874,
    段名: 28,
    折总: 643,
    折算名: 26
  },

  {
    班级: 10,
    姓名: '小张',
    语文: 125,
    语名: 139,
    数学: 147,
    数名: 11,
    英语: 138,
    英名: 88,
    物理: 93,
    物名: 56,
    化学: 91,
    化名: 57,
    生物: 92,
    生名: 65,
    政治: 75,
    政名: 252,
    历史: 91,
    历名: 134,
    地理: 95,
    地名: 29,
    总分: 856,
    段名: 58,
    折总: 633,
    折算名: 47
  },
  {
    班级: 10,
    姓名: '小李',
    语文: 132,
    语名: 21,
    数学: 144,
    数名: 20,
    英语: 144,
    英名: 10,
    物理: 83,
    物名: 190,
    化学: 87,
    化名: 73,
    生物: 84,
    生名: 228,
    政治: 83,
    政名: 140,
    历史: 89,
    历名: 196,
    地理: 88,
    地名: 171,
    总分: 847,
    段名: 74,
    折总: 632,
    折算名: 48
  }
]

import baseMixin from './baseMixin'
export default {
  name: 'BaseTemplateBtn',
  mixins: [baseMixin],
  data() {
    return {
      activeName: 'rule',
      dialogVisiable: false,
      table: {
        id: Date.now(),
        name: '模板',
        column: [],
        data: []
      }
    }
  },
  computed: {
    subjectMap() {
      return this.$store.state.subjectMap
    }
  },
  created() {
    this.table.column = this.subjectMap.reduce(
      (pre, cur) => {
        pre.push(cur.scoreKey)
        pre.push(cur.rankKey)
        return pre
      },
      ['班级', '姓名']
    )
    this.table.column.push(...['总分', '段名', '折总', '折算名'])
    for (let i = 0; i < 3; i++) {
      const item = templateData[i]
      // this.table.column.forEach(key => (item[key] = ''))
      this.table.data.push(item)
    }
  },
  methods: {
    onExport() {
      this.baseExportExcel(this.table)
    }
  }
}
</script>

<style lang="scss" scoped>
.baseTemplateBtn {
  display: inline-block;
  .rules {
    display: flex;
    align-items: end;
    p {
      font-size: 15px;
      line-height: 24px;
      // text-indent: 2em;
    }
  }
  .table {
    th:nth-child(2) {
      width: 30px;
    }
    td {
      height: 20px;
      text-align: center;
      font-size: 12px;
    }
  }
  .content-wrap {
    .card-item {
      display: flex;
      padding-top: 10px;
      .img {
        flex: 1;
        text-align: center;
        img {
          width: 95%;
          object-fit: contain;
          border: 1px solid #dcdfe6;
          box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
            0 0 6px 0 rgba(0, 0, 0, 0.04);
        }
      }
      .explain {
        padding: 0 10px;
        width: 200px;
        flex-shrink: 0;
        border-left: 1px solid #eee;
        &-ul {
          list-style: auto;
          margin-left: 20px;
          line-height: 27px;
          word-wrap: break-word;
          white-space: normal;
        }
      }
    }
  }
}
</style>
