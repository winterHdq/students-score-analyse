<template>
  <el-dialog
    class="compare-dialog"
    :visible.sync="dialogVisible"
    title="比较设置"
    @close="onClose"
  >
    <el-form :model="formData" ref="form" :rules="rules" inline>
      <el-form-item label="基准表格" prop="initTableId">
        <el-select
          v-model="formData.initTableId"
          placeholder="请选择"
          @change="initTableChange"
        >
          <el-option
            v-for="item in tables"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="比较表格" prop="compaseTableId">
        <el-select
          v-model="formData.compaseTableId"
          placeholder="请选择"
          @change="compaseTableChange"
        >
          <el-option
            v-for="item in tables"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <br />
      <el-form-item label="比较列名" prop="compaseTh" style="width: 100%">
        <el-checkbox-group v-model="formData.compaseTh">
          <el-checkbox
            v-for="item in thList"
            :key="item"
            :label="item"
          ></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button @click="onSave" type="primary">保存</el-button>
    </span>
    <el-dialog
      title="比较列表"
      width="90%"
      :visible.sync="compaseTableDialog"
      :append-to-body="true"
    >
      <el-button type="primary" @click="baseExportExcel(compareTable)">
        导出
      </el-button>
      <base-table :table="compareTable"></base-table>
    </el-dialog>
  </el-dialog>
</template>
<script>
import BaseTable from './baseTable'
import baseMixin from './baseMixin'
export default {
  name: 'CompaseDialog',
  components: { BaseTable },
  mixins: [baseMixin],
  props: {
    tables: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      formData: {
        initTableId: null,
        compaseTableId: null,
        compaseTh: []
      },
      initTable: null,
      compaseTable: null,
      rules: {
        initTableId: [{ required: true, message: '请选择' }],
        compaseTableId: [{ required: true, message: '请选择' }],
        compaseTh: [{ required: true, message: '请选择' }]
      },
      thList: [],
      dialogVisible: false,
      compaseTableDialog: false,
      compareTable: {}
    }
  },
  created() {
    this.dialogVisible = true
  },
  methods: {
    initTableChange(id) {
      if (id == this.formData.compaseTableId) {
        this.$message.error('比较的是同一张表格，请确认')
      }
      this.initTable = this.tables.find(item => item.id == id)
      this.thList = Object.keys(this.initTable.data[0])
      this.formData.compaseTh = this.thList.filter(
        item => item !== '姓名' && item.indexOf('名') > 0
      )
    },
    compaseTableChange(id) {
      if (id == this.formData.initTableId) {
        this.$message.error('比较的是同一张表格，请确认')
      }
      this.compaseTable = this.tables.find(item => item.id == id)
    },
    async onSave() {
      await this.$refs.form.validate()
      let res = this.formData.compaseTh.find(
        item => !this.compaseTable.th.includes(item)
      )
      if (res) {
        this.$message.error(
          `比较表格里无【${res}】列，无法进行比较，请重新选择`
        )
        return false
      }
      let compareTable = []
      let tab2 = JSON.parse(JSON.stringify(this.compaseTable.data))
      let tab2Len = tab2.length
      this.initTable.data.forEach(item => {
        let isName = false
        for (let i = 0; i < tab2Len; i++) {
          if (item['姓名'] == tab2[i]['姓名']) {
            isName = true
            let newItem = {}
            for (let k in item) {
              newItem[k] = item[k]
              if (this.formData.compaseTh.includes(k) && !isNaN(item[k])) {
                newItem[`${k}进退`] = 0 - (item[k] - tab2[i][k])
              }
            }
            tab2.splice(i, 1)
            compareTable.push(newItem)
            tab2Len--
            break
          }
        }
        // 新增人员
        if (!isName) {
          compareTable.push(item)
        }
      })
      // 删除人员
      tab2.forEach(item => {
        compareTable.push({
          姓名: item['姓名']
        })
      })
      let compare = {
        name: '进退比较.xls',
        data: compareTable,
        id: Date.now(),
        th: Object.keys(compareTable[0])
      }
      this.compareTable = compare
      this.compaseTableDialog = true
    },
    onClose() {
      this.$emit('onClose')
    }
  }
}
</script>

<style lang="scss" scoped>
.compare-dialog {
}
</style>
