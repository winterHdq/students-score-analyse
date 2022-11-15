<template>
  <div class="baseEchartDownLoadBtn">
    <el-button type="primary" @click="onDownload">下载</el-button>
    <!-- <el-button type="danger" @click="onPrint">打印</el-button> -->
    <el-dialog title="下载" :visible.sync="downloadVisiable">
      <div class="dialog">
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
            :label="item.rankKey"
            :key="item.key"
          ></el-checkbox>
        </el-checkbox-group>
        <span slot="footer" class="dialog-footer">
          <el-button @click="downloadVisiable = false">取 消</el-button>
          <el-button type="primary" @click="onDownload">确 定</el-button>
        </span>
      </div>
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
          name: '段名',
          rankKey: '段名',
          key: 'total'
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
  },
  methods: {
    handleCheckAllChange(val) {
      this.checkedSubject = val ? this.options.map(item => item.label) : []
      this.isIndeterminate = false
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
      this.$parent.isShowEhart.chinese = false
      this.$nextTick(() => {
        // 图表转换成canvas
        html2canvas(document.getElementById('echarts')).then(canvas => {
          var img = canvas
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream')
          // 创建a标签，实现下载
          var creatIMg = document.createElement('a')
          creatIMg.download = `成绩分析-${this.name}.png` // 设置下载的文件名，
          creatIMg.href = img // 下载url
          document.body.appendChild(creatIMg)
          creatIMg.click()
          creatIMg.remove() // 下载之后把创建的元素删除
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.baseEchartDownLoadBtn {
  display: inline-block;
  .dialog {
    background: #201d1d;
    padding: 10px;
  }
}
</style>
