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
        <el-form-item label="表格">
          <el-select
            v-model="formData.selectTablesId"
            multiple
            filterable
            collapse-tags
            placeholder="请选择"
            clearable
            style="width: 300px"
            @change="onSelectHandle"
          >
            <el-option
              v-for="item in options"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
          <el-button type="primary" @click="onAll">全选</el-button>
        </el-form-item>
        <div>
          已选择：
          <el-table :data="selectTables" :height="300" border>
            <el-table-column
              label="序号"
              type="index"
              align="center"
            ></el-table-column>
            <el-table-column
              label="班级"
              prop="className"
              width="70"
              align="center"
            ></el-table-column>
            <el-table-column label="表名" prop="name"></el-table-column>
            <el-table-column
              label="操作"
              #default="{ row, $index }"
              align="center"
              width="100"
            >
              <el-link
                type="danger"
                icon="el-icon-delete-solid"
                @click="onDelect(row.id, $index)"
              ></el-link>
            </el-table-column>
          </el-table>
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
        :selectTablesId="formData.selectTablesId"
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
    }
  },
  data() {
    return {
      tableDialog: false,
      visiableDialog: false,
      selectTables: [],
      formData: {
        name: '成绩分析',
        selectTablesId: []
      },
      rules: {
        name: [{ required: true, message: '请输入' }],
        selectTablesId: [{ required: true, message: '请选择' }]
      }
    }
  },
  created() {
    if (this.table) {
      this.formData.name = this.table.name
      let selectTables = [],
        selectTablesId = []
      this.table.extend.selectTablesId.forEach(id => {
        let res = this.tables.find(v => v.id == id)
        if (res) {
          selectTablesId.push(id)
          selectTables.push(res)
        }
      })
      this.selectTables = selectTables
      this.formData.selectTablesId = selectTablesId
    }
  },
  methods: {
    async onSave() {
      try {
        await this.$refs.form.validate()
        let res = this.selectTables.find(item => !item.className)
        if (res) {
          this.$message.error(`请设置【${res.name}】的班级`)
          return false
        }
        let defClassName = this.selectTables[0].className
        if (this.selectTables.find(item => item.className !== defClassName)) {
          this.$message.error('班级不唯一，请调整')
          return false
        }
        const table = {
          name: this.formData.name,
          id: Date.now(),
          column: [],
          className: defClassName,
          isCompare: true,
          template: 'studentScoreTemplate',
          extend: {
            selectTablesId: this.selectTables.map(item => item.id)
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
        this.onClose()
      } catch (err) {
        console.log(err)
      }
    },
    // 全选
    onAll() {
      this.formData.selectTablesId = this.options.map(item => item.id)
      this.onSelectHandle()
    },
    onDelect(id, index) {
      this.formData.selectTablesId.splice(
        this.formData.selectTablesId.indexOf(id),
        1
      )
      this.selectTables.splice(index, 1)
    },
    onSelectHandle() {
      this.selectTables = this.tables.filter(item =>
        this.formData.selectTablesId.includes(item.id)
      )
    },
    onClose() {
      this.formData.selectTablesId = []
      this.selectTables = []
    }
  }
}
</script>

<style lang="scss" scoped>
.baseScoreAnalyseBtn {
  display: inline-block;
}
</style>
