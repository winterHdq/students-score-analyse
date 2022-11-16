<template>
  <div class="baseEchartDownLoadBtn">
    <el-button type="primary" @click="downloadVisiable = true">下载</el-button>
    <!-- <el-button type="danger" @click="onPrint">打印</el-button> -->
    <el-dialog title="下载" :visible.sync="downloadVisiable">
      <el-form :model="formData">
        <el-form-item label="打印图表">
          <el-checkbox
            :indeterminate="isIndeterminate"
            v-model="checkAll"
            @change="handleCheckAllChange"
          >
            全选
          </el-checkbox>
          <div style="margin: 15px 0"></div>
          <el-checkbox-group
            v-model="formData.checkedSubject"
            @change="handleCheckedCitiesChange"
          >
            <el-checkbox
              v-for="item in options"
              :label="item.key"
              :key="item.key"
            >
              {{ item.rankKey }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="downloadVisiable = false">取 消</el-button>
        <el-button type="primary" @click="onDownload">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import html2canvas from 'html2canvas'

export default {
  name: 'BaseEchartDownLoadBtn',
  props: {
    name: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      downloadVisiable: false,
      formData: {
        checkedSubject: []
      },
      checkAll: false,
      options: [
        {
          name: '折算名',
          rankKey: '折算名',
          key: 'reducedRank'
        },
        {
          name: '段名',
          rankKey: '段名',
          key: 'totalRank'
        }
      ],
      isIndeterminate: true
    }
  },
  computed: {
    subjectMap() {
      return this.$store.state.subjectMap
    }
  },
  created() {
    this.options.push(...this.subjectMap)
    this.handleCheckAllChange(true)
  },
  methods: {
    handleCheckAllChange(val) {
      this.formData.checkedSubject = val
        ? this.options.map(item => item.key)
        : []
      this.isIndeterminate = false
      this.checkAll = val
    },
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length
      this.checkAll = checkedCount === this.options.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.options.length
    },
    onPrint() {
      window.print()
    },
    onDownload() {
      this.$emit('onDownload')
      let isShowEhart = {}
      this.options.forEach(item => {
        if (this.formData.checkedSubject.includes(item.key)) {
          isShowEhart[item.key] = true
        } else {
          isShowEhart[item.key] = false
        }
      })
      isShowEhart.name = true
      this.$parent.isShowEhart = isShowEhart
      this.$nextTick(() => {
        // 图表转换成canvas
        html2canvas(document.getElementById('echarts')).then(canvas => {
          var img = canvas
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream')
          // 创建a标签，实现下载
          var creatIMg = document.createElement('a')
          creatIMg.download = `${this.name}-成绩分析.png` // 设置下载的文件名，
          creatIMg.href = img // 下载url
          document.body.appendChild(creatIMg)
          creatIMg.click()
          creatIMg.remove() // 下载之后把创建的元素删除
          for (let k in isShowEhart) {
            isShowEhart[k] = true
          }
          isShowEhart.name = false
          this.$parent.isShowEhart = isShowEhart
          this.$nextTick(() => {
            this.downloadVisiable = false
          })
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.baseEchartDownLoadBtn {
  display: inline-block;
}
</style>
