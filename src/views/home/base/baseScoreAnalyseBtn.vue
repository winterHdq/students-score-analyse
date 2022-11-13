<template>
  <div class="baseScoreAnalyseBtn">
    <el-button type="primary" plain @click="visiableDialog = true">
      {{ btnName }}
    </el-button>
    <el-dialog
      title="成绩分析"
      :visible.sync="visiableDialog"
      :close-on-click-modal="false"
      @close="onClose"
    >
      <el-form :model="formData" ref="form" :rules="rules" inline>
        <el-form-item label="表名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="表格" prop="">
          <el-select
            v-model="formData.tables"
            multiple
            filterable
            collapse-tags
            placeholder="请选择"
            value-key="id"
            clearable
            :multiple-limit="14"
            style="width: 300px"
          >
            <el-option
              v-for="item in options"
              :key="item.id"
              :label="item.name"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <div>
          已选择：
          <span v-for="(item, index) in formData.tables" :key="item.id">
            {{ item.name }}【{{ item.className || '未知' }}】
            <span v-if="index !== formData.tables.length - 1">、</span>
            <!-- <el-link :underline="false" icon="el-icon-d-arrow-left" @click=""></el-link> -->
          </span>
        </div>
      </el-form>
      <span slot="footer">
        <el-button type="primary" @click="onSave">确定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="成绩分析"
      :visible.sync="tableDialog"
      v-if="tableDialog"
      width="80%"
      top="10vh"
    >
      <student-score-template
        :selectTablesId="selectTables"
        :isDialog="true"
        @onAddTable="
          tableDialog = false
          visiableDialog = false
        "
      ></student-score-template>
    </el-dialog>
  </div>
</template>

<script>
import StudentScoreTemplate from '../template/studentScoreTemplate'
import baseMixin from './baseMixin'
// import { isRepeat } from '@/common/utils'
export default {
  name: 'BaseMulClassAnalyseBtn',
  mixins: [baseMixin],
  components: {
    StudentScoreTemplate
  },
  props: {
    btnName: {
      type: String,
      default: '成绩分析'
    },
    table: {
      type: Object,
      default() {
        return null
      }
    }
  },
  computed: {
    tables() {
      return this.$store.state.tables
    },
    options() {
      return this.tables.filter(item => item.sortObj)
    },
    selectTables() {
      return this.formData.tables.map(item => item.id)
    }
  },
  data() {
    return {
      tableDialog: false,
      visiableDialog: false,
      formData: {
        name: '年段分析',
        tables: []
      },
      rules: {
        name: [{ required: true, message: '请输入' }],
        tables: [{ required: true, message: '请选择' }]
      }
    }
  },
  created() {
    if (this.table) {
      this.formData.name = this.table.name
      let selectTables = []
      this.table.extend.selectTablesId.forEach(id => {
        let res = this.tables.find(v => v.id == id)
        if (!res) {
          this.isTable = false
          this.$message.error(`未找到表${id}，可能已被删除`)
        } else {
          selectTables.push(res)
        }
      })
      this.formData.tables = selectTables
    }
  },
  methods: {
    async onSave() {
      try {
        await this.$refs.form.validate()
        let res = this.formData.tables.find(item => !item.className)
        if (res) {
          this.$message.error(`请设置【${res.name}】的班级`)
          return false
        }
        let defClassName = this.formData.tables[0].className
        if (
          this.formData.tables.find(item => item.className !== defClassName)
        ) {
          this.$message.error('班级不唯一，请调整')
          return false
        }
        const table = {
          name: this.formData.name,
          id: Date.now(),
          column: [],
          className: this.formData.tables[0].className,
          isCompare: false,
          template: 'studentScoreTemplate',
          extend: {
            selectTablesId: this.selectTables
          }
        }
        if (this.table?.id) {
          let _index = null
          this.tables.find((item, index) => {
            if (item.id == this.table.id) {
              _index = index
              return true
            }
          })
          this.tables[_index] = table
          this.$store.commit('setTables', this.tables)
          this.$store.commit('setCurTableId', table.id)
        } else {
          this.$store.commit('addTable', table)
          this.$store.commit('setCurTableId', table.id)
        }
        this.visiableDialog = false
      } catch (err) {
        console.log(err)
      }
    },
    onClose() {
      this.formData.tables = []
    }
  }
}
</script>

<style lang="scss" scoped>
.baseScoreAnalyseBtn {
  display: inline-block;
}
</style>
