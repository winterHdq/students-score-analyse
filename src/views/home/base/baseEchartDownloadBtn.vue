<template>
  <div class="baseEchartDownLoadBtn">
    <el-button type="primary" @click="onDownload">下载</el-button>
    <el-button
      type="primary"
      plain
      style="margin-left: -2px; border-radius: 0 3px 3px 0"
      @click="downloadVisiable = true"
    >
      设置
    </el-button>
    <!-- <el-button type="danger" @click="onPrint">打印</el-button> -->
    <el-dialog
      title="下载设置"
      :visible.sync="downloadVisiable"
      @open="openHandle"
    >
      <el-form :model="formData">
        <el-form-item label="打印列名">
          <el-checkbox
            :indeterminate="isIndeterminateColmn"
            v-model="checkAllColumn"
            @change="handleCheckAllColumnChange"
          >
            全选
          </el-checkbox>
          <div style="margin: 15px 0"></div>
          <el-checkbox-group
            v-model="formData.checkedColumn"
            @change="handleCheckedColumnChange"
          >
            <el-checkbox
              v-for="(item, index) in table.column"
              :label="item"
              :key="item"
              :disabled="index == 0"
            >
              {{ item }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
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
            @change="handleCheckedChange"
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
        <el-button type="primary" @click="onSave">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import html2canvas from 'html2canvas'
import baseMixin from '../base/baseMixin'
import { mapState, mapGetters } from 'vuex'
export default {
  name: 'BaseEchartDownLoadBtn',
  mixins: [baseMixin],
  props: {
    name: {
      type: String,
      required: true
    },
    table: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      downloadVisiable: false,
      formData: {
        checkedColumn: [],
        checkedSubject: []
      },
      checkAll: true,
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
      isIndeterminate: true,
      isIndeterminateColmn: true,
      checkAllColumn: false
    }
  },
  computed: {
    ...mapState({
      subjectMap: state => state.subjectMap,
      downloadSetting: state => state.downloadSetting
    }),
    ...mapGetters(['subjectList'])
  },
  created() {
    this.options.push(...this.subjectMap)
  },
  methods: {
    openHandle() {
      if (this.downloadSetting) {
        this.formData.checkedColumn = [
          this.name,
          ...this.downloadSetting.checkedColumn
        ]
        this.formData.checkedSubject = this.downloadSetting.checkedSubject
      } else {
        this.table.column.forEach(k => {
          if (!this.subjectList.includes(k)) {
            this.formData.checkedColumn.push(k)
          }
        })
        this.handleCheckAllChange(true)
      }
    },
    handleCheckAllChange(val) {
      this.formData.checkedSubject = val
        ? this.options.map(item => item.key)
        : []
      this.isIndeterminate = false
    },
    handleCheckAllColumnChange(val) {
      this.formData.checkedColumn = val ? this.table.column : [this.name]
      this.isIndeterminateColumn = false
    },
    handleCheckedChange(value) {
      let checkedCount = value.length
      this.checkAll = checkedCount === this.options.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.options.length
    },
    handleCheckedColumnChange(value) {
      let checkedCount = value.length
      this.checkAllColumn = checkedCount === this.table.column.length
      this.isIndeterminateColumn =
        checkedCount > 0 && checkedCount < this.table.column.length
    },
    onPrint() {
      window.print()
    },
    onSave() {
      let formData = JSON.parse(JSON.stringify(this.formData))
      formData.checkedColumn.splice(0, 1)
      this.$store.commit('setDownloadSetting', formData)
      this.downloadVisiable = false
    },
    downloadTable() {
      let list = []
      this.table.data.forEach(item => {
        let _item = {}
        for (let k in item) {
          if (this.formData.checkedColumn.includes(k)) {
            _item[k] = item[k]
          }
        }
        list.push(_item)
      })
      let downloadTable = {
        name: this.table.name,
        className: this.table.className,
        column: this.formData.checkedColumn,
        data: list,
        isCompare: true
      }
      this.baseExportExcel(downloadTable)
    },
    onDownload() {
      this.downloadTable()
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
