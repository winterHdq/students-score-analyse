<!-- 官网：https://echarts.apache.org/handbook/zh/get-started/ -->
<template>
  <div class="Echarts">
    <div
      style="width: 1200px; height: 300px"
      id="score"
      class="echartitem"
    ></div>
    <div style="width: 800px; height: 300px" id="rang" class="echartitem"></div>
    <div
      style="width: auto; height: 300px"
      id="scoreName"
      class="echartitem"
    ></div>
    <div style="width: 200px; height: 300px" id="pass" class="echartitem"></div>
  </div>
</template>
<script>
export default {
  name: 'EchartsView',
  components: {},
  mixins: [],
  props: {},
  data() {
    return {
      scoreList: [],
      otherList: [
        {
          label: '最高分',
          value: 0
        },
        {
          label: '最低分',
          value: 0
        },
        {
          label: '不及格数',
          value: 0
        },
        {
          label: '及格数',
          value: 0
        },
        {
          label: '及格率%',
          value: 0
        },
        {
          label: '优秀数',
          value: 0
        },
        {
          label: '优秀率%',
          value: 0
        },
        {
          label: '与考人数',
          value: 0
        }
      ],
      rangList: [],
      scoreALl: [
        {
          name: '薛楷宸',
          score: 143.5
        },
        {
          name: '陈思源',
          score: 142.5
        },
        {
          name: '刘宸瑜',
          score: 140.5
        },
        {
          name: '张峥',
          score: 140.5
        },
        {
          name: '周梓依',
          score: 139
        },
        {
          name: '伍子畅',
          score: 136
        },
        {
          name: '戴紫晴',
          score: 135
        },
        {
          name: '陈羽诺',
          score: 132
        },
        {
          name: '肖祖浩',
          score: 129
        },
        {
          name: '朱杰铭',
          score: 129
        },
        {
          name: '李净',
          score: 128
        },
        {
          name: '张梓骏',
          score: 128
        },
        {
          name: '吴宇锋',
          score: 127.5
        },
        {
          name: '邬嘉钰',
          score: 127.5
        },
        {
          name: '李菁',
          score: 127.5
        },
        {
          name: '卓子馨',
          score: 126.5
        },
        {
          name: '张睿烜',
          score: 122
        },
        {
          name: '陈可欣',
          score: 117.5
        },
        {
          name: '许向航',
          score: 114.5
        },
        {
          name: '廖明朗',
          score: 113.5
        },
        {
          name: '陈子睿',
          score: 112.5
        },
        {
          name: '徐越',
          score: 111
        },
        {
          name: '林美哲',
          score: 108.5
        },
        {
          name: '杨锨',
          score: 106
        },
        {
          name: '周家睿',
          score: 105.5
        },
        {
          name: '吴浩铭',
          score: 103.5
        },
        {
          name: '丁张逸轩',
          score: 102.5
        },
        {
          name: '王睿曦',
          score: 100.5
        },
        {
          name: '刘卓妍',
          score: 99
        },
        {
          name: '黄嘉俊',
          score: 90
        },
        {
          name: '郭语涵',
          score: 89
        },
        {
          name: '罗棕信',
          score: 88
        },
        {
          name: '任静瑜',
          score: 86.5
        },
        {
          name: '林心怡',
          score: 84.5
        },
        {
          name: '朱晋尧',
          score: 83
        },
        {
          name: '陈芷蝶',
          score: 76
        },
        {
          name: '李雯萱',
          score: 71.5
        },
        {
          name: '廖桓艺',
          score: 69.5
        },
        {
          name: '王歆迪',
          score: 66.5
        },
        {
          name: '陈子涵',
          score: 64
        },
        {
          name: '吴雨柠',
          score: 63.5
        },
        {
          name: '徐苗杰',
          score: 63
        },
        {
          name: '邱含杏',
          score: 62.5
        },
        {
          name: '陈镁娅',
          score: 61.5
        },
        {
          name: '谢恩洁',
          score: 57.5
        },
        {
          name: '姜伊依',
          score: 55
        },
        {
          name: '林惠子',
          score: 49
        },
        {
          name: '张传杰',
          score: 35
        },
        {
          name: '陈俊亨',
          score: 31
        },
        {
          name: '刘恩萁',
          score: 0
        }
      ],
      config: {
        fullScore: 150
      }
    }
  },
  created() {
    this.scoreList = this.getScoreList()
    this.rangList = this.getRangList()
  },
  mounted() {
    this.echartsScoreInit()
    this.echartsScoreNameInit()
    this.echartsRangInit()
    this.echartsPassInit()
  },
  methods: {
    getScoreList() {
      let scoreList = []
      for (let i = 14; i >= 0; i--) {
        let startScore = i * 10
        let endScore = startScore + 9
        scoreList.push({
          label: `${startScore}-${endScore}`,
          value: 0
        })
      }
      if (this.config.fullScore === 150) {
        scoreList[0].label = '140-150'
      } else {
        scoreList.splice(0, 5)
        scoreList[0].label = '90-100'
      }
      return scoreList
    },
    getRangList() {
      let rangList = [
        {
          label: '前10名',
          value: 0
        }
      ]
      for (let i = 50; i <= 400; i += 50) {
        rangList.push({
          label: `前${i}名`,
          value: 0
        })
      }
      rangList.push({
        label: '400名后',
        value: 0
      })
      return rangList
    },
    echartsScoreInit() {
      this.$echarts.init(document.getElementById('score')).setOption({
        title: {
          text: '英语',
          textStyle: {
            color: '#777'
          }
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
          splitNumber: 3,
          //   boundaryGap: ['20%', '20%'],
          type: 'category',
          data: this.scoreList.map(item => item.label)
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '人数',
            data: [14, 8, 5, 2, 6, 1, 2, 3, 4, 3, 1, 1, 0, 0, 0],
            type: 'bar',
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(220, 220, 220, 0.8)'
            }
          }
        ]
      })
    },
    echartsRangInit() {
      this.$echarts.init(document.getElementById('rang')).setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        title: {
          text: '英语',
          textStyle: {
            color: '#777'
          }
        },
        xAxis: {
          name: '名次',
          splitNumber: 3,
          //   boundaryGap: ['20%', '20%'],
          type: 'category',
          data: this.rangList.map(item => item.label),
          axisTick: {
            length: 5
          },
          axisPointerObject: {
            show: true
            // type: 'line'
          }
        },
        yAxis: {
          name: '人数',
          type: 'value'
        },
        series: [
          {
            name: '人数',
            data: [0, 3, 9, 14, 16, 17, 20, 23, 25, 25],
            type: 'bar',
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(220, 220, 220, 0.8)'
            }
          }
        ]
      })
    },
    echartsScoreNameInit() {
      this.$echarts.init(document.getElementById('scoreName')).setOption({
        title: {
          text: '英语',
          textStyle: {
            color: '#777',
            fontSize: '16px',
            lineHeight: 30
          }
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
          data: this.scoreALl.map(item => item.name),
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
            data: this.scoreALl.map(item => item.score),
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
                },
                {
                  name: '折算名',
                  yAxis: 130
                }
              ],
              label: {
                show: true,
                formatter: '{b}:{c}'
              }
            }
          }
        ]
      })
    },
    echartsPassInit() {
      this.$echarts.init(document.getElementById('pass')).setOption({
        tooltip: {
          trigger: 'item'
        },
        legend: {
          show: true,
          zlevel: 0,
          z: 2,
          top: '5%',
          left: 'center'
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
              formatter: '{b}：({d}%)'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '14',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: true
            },
            data: [
              { value: 36, name: '及格数' },
              { value: 14, name: '不及格数' }
            ]
          }
        ]
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.Echarts {
  .echartitem {
    border: 1px solid #e5e7eb;
    box-shadow: rgb(10 9 9 / 10%) 0px 0px 5px;
    margin: 10px;
    border-radius: 5px;
  }
}
</style>
