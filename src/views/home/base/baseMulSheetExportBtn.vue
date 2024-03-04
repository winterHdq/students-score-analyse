<template>
  <div class="baseMulSheetExportBtn">
    <el-button type="primary" plain @click="visiableDialog = true">
      合表导出
    </el-button>
    <el-dialog
      title="合表导出"
      :visible.sync="visiableDialog"
      :close-on-click-modal="false"
      width="80%"
    >
      <el-form :model="formData" ref="form" :rules="rules" inline>
        <el-form-item label="表名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入"></el-input>
        </el-form-item>
        <el-table :data="formData.tables" border>
          <el-table-column
            type="index"
            label="序号"
            align="center"
            width="70"
          ></el-table-column>
          <el-table-column label="工作簿名" #default="{ $index }" width="200px">
            <el-form-item
              :prop="`tables.${$index}.name`"
              :rules="rules.tableName"
            >
              <el-select
                v-model="formData.tables[$index].name"
                placeholder="请选择"
                @change="tableChangeHandle($event, $index)"
              >
                <el-option
                  v-for="item in dataTables"
                  :key="item.id"
                  :value="item.id"
                  :label="item.name"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-table-column>
          <el-table-column label="列名" #default="{ $index }">
            <el-form-item
              :prop="`tables.${$index}.column`"
              :rules="rules.tableColumn"
            >
              <el-checkbox-group v-model="formData.tables[$index].column">
                <el-checkbox
                  v-for="item in formData.tables[$index].th"
                  :key="item"
                  :label="item"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-table-column>
          <el-table-column width="100" align="center">
            <template #header>
              <el-button
                type="primary"
                @click="formData.tables.push({ name: '', column: [] })"
              >
                添加
              </el-button>
            </template>
            <template #default="{ $index }">
              <el-button type="danger" @click="onDelect($index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <span slot="footer">
        <el-button type="primary" @click="onExport">导出</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import baseMixin from './baseMixin'
export default {
  name: 'BaseMulSheetExportBtn',
  mixins: [baseMixin],
  computed: {
    tables() {
      return this.$store.state.tables
    },
    dataTables() {
      return this.tables.filter(item => item.data)
    }
  },
  data() {
    return {
      visiableDialog: false,
      formData: {
        name: '',
        tables: [{ name: '', column: [] }]
      },
      rules: {
        name: [{ required: true, message: '请输入' }],
        tableName: [{ required: true, message: '请选择' }],
        tableColumn: [{ required: true, message: '请选择' }]
      }
    }
  },
  methods: {
    tableChangeHandle(val, index) {
      const table = this.tables.find(item => item.id === val)
      this.formData.tables[index].table = table
      this.formData.tables[index].th = table.column
      this.formData.tables[index].column = table.column
    },
    onDelect(index) {
      this.formData.tables.splice(index, 1)
    },
    async onExport() {
      try {
        await this.$refs.form.validate()
        let sheets = []
        this.formData.tables.forEach(item => {
          let data = {
            id: item.table.id,
            className: item.table.className,
            isCompare: item.table.isCompare || false,
            data: [],
            column: item.column,
            name: item.table.name
          }
          item.table.data.forEach(list => {
            let _item = {}
            for (const key in list) {
              if (item.column.includes(key)) {
                _item[key] = list[key]
              }
            }
            data.data.push(_item)
          })
          sheets.push(data)
        })
        const table = {
          name: this.formData.name,
          sheets
        }
        this.baseExportMulSheetExcel(table)
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.baseMulSheetExportBtn {
  display: inline-block;
}
</style>
