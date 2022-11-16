<template>
  <div class="baseExportBtn">
    <el-button type="primary" @click="exportExcelHandle" v-if="isExportBtn">
      导出
    </el-button>
    <el-button
      type="success"
      @click="exportMultipleSheetsExcelHandle"
      class="btn"
      v-if="isMultiple"
    >
      分科导出
    </el-button>
    <el-dialog
      top="20vh"
      title="导出"
      :visible.sync="dialogVisible"
      :append-to-body="true"
      :close-on-click-modal="false"
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
    <el-dialog
      top="20vh"
      title="分科导出"
      :visible.sync="dialogVisibleMul"
      :append-to-body="true"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      width="80%"
    >
      <el-button @click="onExportMul" type="primary">导出</el-button>
      <el-form :model="formDataMul" ref="formMul" :rules="rulesMul" inline>
        <el-table :data="formDataMul.tables" border>
          <el-table-column
            type="index"
            label="序号"
            width="50"
            align="center"
          ></el-table-column>
          <el-table-column label="表名" #default="{ $index }" width="150">
            <el-form-item :prop="`tables.${$index}.name`" :rules="rules.name">
              <el-input
                v-model="formDataMul.tables[$index].name"
                placeholder="请输入"
              ></el-input>
            </el-form-item>
          </el-table-column>
          <el-table-column
            label="列名"
            #default="{ $index }"
            :rules="{ required: true }"
          >
            <el-form-item
              :prop="`tables.${$index}.column`"
              :rules="rules.column"
            >
              <el-checkbox-group v-model="formDataMul.tables[$index].column">
                <el-checkbox
                  v-for="item in thList"
                  :key="item"
                  :label="item"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-table-column>
          <el-table-column
            label="操作"
            #default="{ $index }"
            width="80"
            align="center"
          >
            <el-button
              type="primary"
              @click="onAddSheet"
              v-if="$index == formDataMul.tables.length - 1"
            >
              添加
            </el-button>
            <el-button
              type="danger"
              @click="onDelectSheet($index)"
              style="margin-left: 0px"
              v-if="formDataMul.tables.length - 1"
            >
              删除
            </el-button>
          </el-table-column>
        </el-table>
      </el-form>
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
    },
    isExportBtn: {
      type: Boolean,
      default: true
    },
    isMultiple: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    thList() {
      return this.table.column || Object.keys(this.table.data[0])
    },
    subjectList() {
      return this.$store.getters.subjectList
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
        name: [{ required: true, message: '请输入' }],
        column: [{ required: true, message: '请选择' }]
      },
      dialogVisibleMul: false,
      rulesMul: {},
      formDataMul: {
        tables: []
      }
    }
  },
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
    onAddSheet(obj = {}) {
      this.formDataMul.tables.push({
        id: Date.now(),
        name: obj.name || '',
        column: obj.column || [],
        data: [],
        isCompare: true
      })
    },
    onDelectSheet(index) {
      this.formDataMul.tables.splice(index, 1)
    },
    // 分科导出
    exportMultipleSheetsExcelHandle() {
      this.dialogVisibleMul = true
      this.formDataMul.tables = []
      this.thList.forEach(k => {
        if (this.subjectList.includes(k)) {
          let sheet = {
            name: `${k}${this.table.isCompare ? '进退分析' : ''}`,
            column: ['姓名', '班级', k]
          }
          this.thList.includes(this.subjectObj[k].rankKey) &&
            sheet.column.push(this.subjectObj[k].rankKey)
          this.thList.includes(`${this.subjectObj[k].rankKey}进退`) &&
            sheet.column.push(`${this.subjectObj[k].rankKey}进退`)
          this.thList.includes(`${this.subjectObj[k].rankKey}差值`) &&
            sheet.column.push(`${this.subjectObj[k].rankKey}差值`)
          ;['折总', '折算名'].forEach(key => {
            if (this.thList.includes(key)) {
              sheet.column.push(key)
            }
          })
          this.onAddSheet(sheet)
        }
      })
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
          column: this.formData.column,
          name: this.formData.name
        },
        true
      )
      this.$message.warning('正在导出')
      this.dialogVisible = false
    },
    async onExportMul() {
      try {
        await this.$refs.formMul.validate()
        this.formDataMul.tables.forEach(item => (item.data = []))
        this.table.data.forEach(list => {
          this.formDataMul.tables.forEach(table => {
            let _item = {}
            for (let k in list) {
              if (table.column.includes(k)) {
                _item[k] = list[k]
              }
            }
            table.data.push(_item)
          })
        })
        const table = {
          name: `${this.table.name}-分科`,
          sheets: this.formDataMul.tables
        }
        this.baseExportMulSheetExcel(table)
        this.$message.warning('正在导出')
        this.dialogVisibleMul = false
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.baseExportBtn {
  display: inline-block;
  .btn {
    margin-left: 10px;
  }
}
</style>
