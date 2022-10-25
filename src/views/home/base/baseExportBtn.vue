<template>
  <div class="baseExportBtn">
    <el-button type="primary" @click="exportExcelHandle">导出</el-button>
    <el-dialog
      top="20vh"
      title="导出"
      :visible.sync="dialogVisible"
      :append-to-body="true"
    >
      <el-form :model="formData" ref="form" :rules="rules" inline>
        <el-form-item label="导出名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入导出表格的名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="导出列" prop="column">
          <el-checkbox
            :indeterminate="checkData.showThIndeterminate"
            v-model="checkData.showThCheckAll"
            @change="handleCheckAllChange"
          >
            全选
          </el-checkbox>
          <el-checkbox-group
            v-model="formData.column"
            @change="handleCheckChange"
          >
            <el-checkbox
              v-for="item in thList"
              :key="item"
              :label="item"
            ></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button @click="onExport" type="primary">导出</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import baseMixin from './baseMixin'
export default {
  name: 'BaseExportBtn',
  components: {},
  mixins: [baseMixin],
  props: {
    table: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    thList() {
      return this.table.th || Object.keys(this.table.data[0])
    }
  },
  data() {
    return {
      dialogVisible: false,
      formData: {
        name: '',
        column: []
      },
      checkData: {
        showThCheckAll: true,
        showThIndeterminate: false
      },
      rules: {
        name: [{ required: true, message: '请选择' }],
        column: [{ required: true, message: '请选择' }]
      }
    }
  },
  created() {},
  mounted() {},
  methods: {
    handleCheckAllChange(res) {
      this.formData.column = res ? this.thList : []
      this.checkData.showThIndeterminate = false
    },
    handleCheckChange(res) {
      let checkedCount = res.length
      this.checkData.showThCheckAll = checkedCount === this.thList.length
      this.checkData.showThIndeterminate =
        checkedCount > 0 && checkedCount < this.thList.length
    },
    // 导出
    exportExcelHandle() {
      this.formData.name = this.table.name
      this.formData.column = this.thList
      this.dialogVisible = true
    },
    async onExport() {
      await this.$refs.form.validate()
      let table = []
      this.table.data.forEach(list => {
        let _item = {}
        for (let k in list) {
          if (this.formData.column.includes(k)) {
            _item[k] = list[k]
          }
        }
        table.push(_item)
      })
      this.baseExportExcel(
        {
          ...this.table,
          data: table,
          name: this.formData.name
        },
        true
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.baseExportBtn {
}
</style>
