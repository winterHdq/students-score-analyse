<template>
  <el-dialog
    class="compare-dialog"
    :visible.sync="dialogVisible"
    title="名次比较设置"
    :close-on-click-modal="false"
    @close="onClose"
  >
    <!-- <p class="tipText">
      说明：通过差值显示学生的优劣科目（科目差值： 折算名/段名 - 科目名）
    </p> -->
    <el-form
      :model="formData"
      ref="form"
      :rules="rules"
      inline
      label-width="80px"
    >
      <el-form-item label="比较列" prop="compareTh">
        <el-checkbox
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
import BaseTable from '../base/baseTable'
import BaseExportBtn from '../base/baseExportBtn'
import baseMixin from '../base/baseMixin'
import { subtract } from '@/common/utils'
export default {
  name: 'CompareDialog',
  components: { BaseTable, BaseExportBtn },
  mixins: [baseMixin],
  props: {
    curTable: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      formData: {
        compareTh: []
      },
      checkData: {
        compareThCheckAll: false,
        compareThIndeterminate: false
      },
      rules: {
        compareTh: [{ required: true, message: '请选择' }]
      },
      dialogVisible: false,
      compareTableDialog: false,
      compareTable: {}
    }
  },
  computed: {
    tables() {
      return this.$store.state.tables
    },
    subjectRankList() {
      return this.$store.getters.subjectRankList
    },
    thList() {
      return this.curTable.column
    }
  },
  created() {
    this.getBaseTable()
  },
  methods: {
    getBaseTable() {
      this.curTable.column.forEach(k => {
        if (this.subjectRankList.includes(k)) {
          this.formData.compareTh.push(k)
        }
      })
      this.thList.includes('段名') && this.formData.compareTh.push('段名')
      this.dialogVisible = true
    },
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
    getInitOrderTh() {
      // 保持原本的排序
      const compareTh = this.thList.filter(item =>
        this.formData.compareTh.includes(item)
      )
      return compareTh
    },
    async onSave() {
      await this.$refs.form.validate()
      let compareTable = []
      this.curTable.data.forEach(item => {
        let newItem = {}
        let advantage = [],
          inferiority = []
        let totalRank = item['折算名'] || item['段名'] || null
        for (let k in item) {
          newItem[k] = item[k]
          if (
            item[k] &&
            this.formData.compareTh.includes(k) &&
            totalRank &&
            !isNaN(item[k])
          ) {
            let dValue = subtract(totalRank, item[k])
            newItem[`${k.substr(0, 1)}差`] = dValue
            if (dValue > 50) {
              advantage.push(k)
            } else if (dValue < -50) {
              inferiority.push(k)
            }
          }
        }
        newItem['优势'] = advantage.join('、')
        newItem['劣势'] = inferiority.join('、')
        compareTable.push(newItem)
      })
      const compareTh = Object.keys(compareTable[0])
      let compare = {
        name: `${this.curTable.name}-优劣分析`,
        data: compareTable,
        id: Date.now(),
        column: compareTh,
        className: `${this.curTable.className}`,
        isCompare: true
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
  .tipText {
    color: red;
    margin: -30px 10px 20px 0px;
  }
}
</style>
