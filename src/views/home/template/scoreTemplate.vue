<template>
  <div class="scoreTemplate">
    <div class="btns">
      <base-class-setting
        ref="setting"
        v-model="curTable.className"
      ></base-class-setting>
      <template v-if="curTable.sortObj">
        <el-button
          v-for="item in subjectMap"
          :key="item.type"
          plain
          type="primary"
          size="small"
          class="btn"
          @click="openSortDialog(item.name)"
        >
          {{ item.name }}分析
        </el-button>
      </template>
    </div>
    <base-table
      ref="baseTable"
      :table-height="tableHeight"
      :table="curTable"
    ></base-table>
    <sort-dialog
      v-if="sortCompareDialog.show"
      :subjectName="sortCompareDialog.name"
      :curTable="curTable"
      @onClose="sortCompareDialog.show = false"
    ></sort-dialog>
  </div>
</template>

<script>
import BaseClassSetting from '../base/baseClassSetting'
import BaseTable from '../base/baseTable'
import SortDialog from '../sortDialog'
export default {
  name: 'ScoreTemplate',
  components: {
    BaseClassSetting,
    BaseTable,
    SortDialog
  },
  props: {
    tableHeight: {
      type: Number,
      default: 500
    }
  },
  data() {
    return {
      sortCompareDialog: {
        show: false,
        name: ''
      }
    }
  },
  computed: {
    subjectMap() {
      return this.$store.state.subjectMap
    },
    curTable() {
      return this.$store.getters.curTable || {}
    }
  },
  methods: {
    async openSortDialog(name) {
      try {
        await this.$refs.setting.validate()
        this.sortCompareDialog.name = name
        this.sortCompareDialog.show = true
      } catch (err) {
        console.log(err)
        this.$message.error('请先设置班级')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.scoreTemplate {
  .btns {
    display: flex;
    padding: 10px;
    .left {
      flex: 1;
    }
    .right {
      margin: 0 auto;
    }
  }
}
</style>
