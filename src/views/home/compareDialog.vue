<template>
  <el-dialog
    class="compare-dialog"
    :visible.sync="dialogVisible"
    title="比较设置"
    :close-on-click-modal="false"
    @close="onClose"
  >
    <el-form
      :model="formData"
      ref="form"
      :rules="rules"
      inline
      label-width="80px"
    >
      <el-form-item label="本次成绩" prop="initTableId">
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
      <el-form-item label="上次成绩" prop="compareTableId">
        <el-select
          v-model="formData.compareTableId"
          placeholder="请选择"
          @change="compareTableChange"
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
      <el-form-item label="基准" prop="baseTh">
        <el-select v-model="formData.baseTh" placeholder="">
          <el-option
            v-for="item in thList"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
        <span class="tip">
          请确保基准列数据唯一，比如以【姓名】为基准比较两个表格
        </span>
      </el-form-item>
      <br />
      <!-- <el-form-item label="展示列" prop="showTh">
        <el-checkbox
          v-if="formData.initTableId"
          :indeterminate="checkData.showThIndeterminate"
          v-model="checkData.showThCheckAll"
          @change="handleCheckAllChange($event, 'showTh')"
        >
          全选
        </el-checkbox>
        <el-checkbox-group
          v-model="formData.showTh"
          @change="handleCheckChange($event, 'showTh')"
        >
          <el-checkbox
            v-for="item in thList"
            :key="item"
            :label="item"
          ></el-checkbox>
        </el-checkbox-group>
      </el-form-item> -->
      <br />
      <el-form-item label="比较列" prop="compareTh">
        <el-checkbox
          v-if="formData.initTableId"
          :indeterminate="checkData.compareThIndeterminate"
          v-model="checkData.compareThCheckAll"
          @change="handleCheckAllChange($event, 'compareTh')"
        >
          全选
        </el-checkbox>
        <el-checkbox-group v-model="formData.compareTh">
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
      :visible.sync="compareTableDialog"
      :append-to-body="true"
      :close-on-click-modal="false"
      v-if="compareTableDialog"
    >
      <base-export-btn
        :table="compareTable"
        :isMultiple="true"
      ></base-export-btn>
      <el-button type="danger" @click="onAddList" style="margin-left: 10px">
        添加到列表
      </el-button>
      <base-table :table="compareTable"></base-table>
    </el-dialog>
  </el-dialog>
</template>
<script>
import BaseTable from './base/baseTable'
import BaseExportBtn from './base/baseExportBtn'
import baseMixin from './base/baseMixin'
import { isRepeat, subtract } from '@/common/utils'
export default {
  name: 'CompareDialog',
  components: { BaseTable, BaseExportBtn },
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
        compareTableId: null,
        baseTh: '',
        compareTh: []
        // showTh: []
      },
      checkData: {
        showThCheckAll: false,
        showThIndeterminate: false,
        compareThCheckAll: false,
        compareThIndeterminate: false
      },
      initTable: null,
      preTable: null,
      rules: {
        initTableId: [{ required: true, message: '请选择' }],
        compareTableId: [{ required: true, message: '请选择' }],
        baseTh: [{ required: true, message: '请选择' }],
        compareTh: [{ required: true, message: '请选择' }]
        // showTh: [{ required: true, message: '请选择' }]
      },
      thList: [],
      dialogVisible: false,
      compareTableDialog: false,
      compareTable: {}
    }
  },
  created() {
    this.dialogVisible = true
  },
  methods: {
    handleCheckAllChange(res, key) {
      this.formData[key] = res ? this.thList : []
      this.checkData[`${key}Indeterminate`] = false
    },
    handleCheckChange(value, key) {
      let checkedCount = value.length
      this.checkData[`${key}CheckAll`] = checkedCount === this.thList.length
      this.checkData[`${key}Indeterminate`] =
        checkedCount > 0 && checkedCount < this.thList.length
    },
    initTableChange(id) {
      if (id == this.formData.compareTableId) {
        this.$message.error('比较的是同一张表格，请确认')
      }
      this.initTable = this.tables.find(item => item.id == id)
      this.thList = Object.keys(this.initTable.data[0])
      this.formData.compareTh = this.thList.filter(
        item => item !== '姓名' && item.indexOf('名') > 0
      )
      // this.formData.showTh = this.thList
      this.formData.baseTh =
        this.thList.find(item => item == '姓名') || this.thList[0]
      // this.handleCheckChange(this.thList, 'showTh')
    },
    compareTableChange(id) {
      if (id == this.formData.initTableId) {
        this.$message.error('比较的是同一张表格，请确认')
      }
      this.preTable = this.tables.find(item => item.id == id)
    },
    async onSave() {
      await this.$refs.form.validate()
      // 去重，判断基准是否唯一
      if (
        isRepeat(this.initTable.data.map(item => item[this.formData.baseTh]))
      ) {
        this.$message.error(
          `本次成绩【${this.formData.baseTh}】基准列存在重复值，请修改`
        )
        return false
      }
      if (!this.preTable.column.includes(this.formData.baseTh)) {
        this.$message.error(
          `上次成绩无【${this.formData.baseTh}】基准列，请重新选择`
        )
        return false
      }
      let res = this.formData.compareTh.find(
        item => !this.preTable.column.includes(item)
      )
      if (res) {
        this.$message.error(
          `上次成绩里无【${res}】列，无法进行比较，请重新选择`
        )
        return false
      }
      let compareTable = []
      let tab2 = JSON.parse(JSON.stringify(this.preTable.data))
      let tab2Len = tab2.length
      this.initTable.data.forEach(item => {
        let isName = false
        for (let i = 0; i < tab2Len; i++) {
          if (item[this.formData.baseTh] == tab2[i][this.formData.baseTh]) {
            isName = true
            let newItem = {}
            for (let k in item) {
              newItem[k] = item[k]
              if (this.formData.compareTh.includes(k) && !isNaN(item[k])) {
                newItem[`${k}进退`] = subtract(item[k], tab2[i][k])
                // 名次是越小越好
                if (k.indexOf('名') > 0) {
                  newItem[`${k}进退`] = 0 - newItem[`${k}进退`]
                }
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
          // 补齐数据，为了导出有单元格边框
          this.formData.compareTh.forEach(k => (item[`${k}进退`] = ''))
          compareTable.push(item)
        }
      })
      const compareTh = Object.keys(compareTable[0])
      // 删除人员
      tab2.forEach(item => {
        let _item = {}
        // 补齐数据，为了导出有单元格边框
        compareTh.forEach(k => {
          // 排除undefined
          if (item[k] && isNaN(item[k])) {
            _item[k] = item[k]
          } else {
            _item[k] = ''
          }
        })
        compareTable.push(_item)
      })
      let compare = {
        name: `${this.initTable.name}-${this.initTable.className}-进退比较`,
        data: compareTable,
        id: Date.now(),
        column: compareTh,
        className: `${this.initTable.className}`,
        isCompare: true,
        extend: {
          compareColumn: this.formData.compareTh,
          preTable: this.preTable
        }
      }
      this.compareTable = compare
      this.compareTableDialog = true
    },
    onAddList() {
      this.$store.commit('addTable', this.compareTable)
      this.$store.commit('setCurTableId', this.compareTable.id)
      this.onClose()
    },
    onClose() {
      this.$emit('onClose')
    }
  }
}
</script>

<style lang="scss" scoped>
.compare-dialog {
  .tip {
    color: red;
    font-size: 12px;
    margin-left: 10px;
  }
}
</style>
