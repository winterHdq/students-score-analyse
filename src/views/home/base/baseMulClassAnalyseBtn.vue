<template>
  <div class="baseMulClassAnalyseBtn">
    <el-button type="primary" plain @click="visiableDialog = true">
      年段分析
    </el-button>
    <el-dialog
      title="年段分析"
      :visible.sync="visiableDialog"
      :close-on-click-modal="false"
      @close="onClose"
    >
      <el-form :model="formData" ref="form" :rules="rules" inline>
        <el-form-item label="表名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="班级" prop="classes">
          <el-select
            v-model="formData.classes"
            multiple
            filterable
            collapse-tags
            placeholder="请选择"
            value-key="id"
            clearable
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
        <!-- <div>
          已选择：
          <span v-for="(item, index) in formData.classes" :key="item.id">
            {{ item.name }}【{{ item.className || '未知' }}】
            <span v-if="index !== formData.classes.length - 1">、</span>
          </span>
        </div> -->
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
      :title="formData.name"
      :visible.sync="tableDialog"
      v-if="tableDialog"
      width="80%"
      top="10vh"
    >
      <total-sort-template
        :classes="selectTables.map(item => item.id)"
        :tableName="formData.name"
        :isDialog="true"
        @onAddTable="
          tableDialog = false
          visiableDialog = false
        "
      ></total-sort-template>
    </el-dialog>
  </div>
</template>

<script>
import TotalSortTemplate from '../template/totalSortTemplate'
import baseMixin from './baseMixin'
import { isRepeat } from '@/utils/utils'
export default {
  name: 'BaseMulClassAnalyseBtn',
  mixins: [baseMixin],
  components: {
    TotalSortTemplate
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
      formData: {
        name: '年段分析',
        classes: []
      },
      selectTables: [],
      rules: {
        name: [{ required: true, message: '请输入' }],
        classes: [{ required: true, message: '请选择' }]
      }
    }
  },
  methods: {
    // 全选
    onAll() {
      this.formData.classes = this.options.map(item => item.id)
      this.onSelectHandle()
    },
    onSelectHandle() {
      this.selectTables = this.tables.filter(item =>
        this.formData.classes.includes(item.id)
      )
    },
    onDelect(id, index) {
      this.formData.classes.splice(this.formData.classes.indexOf(id), 1)
      this.selectTables.splice(index, 1)
    },
    async onSave() {
      try {
        await this.$refs.form.validate()
        let res = this.selectTables.find(item => !item.className)
        if (res) {
          this.$message.error(`请设置【${res.name}】的班级`)
          return false
        }
        if (isRepeat(this.selectTables.map(item => item.className))) {
          this.$message.error('班级重复，请确认')
          return false
        }
        this.tableDialog = true
      } catch (err) {
        console.log(err)
      }
    },
    onClose() {
      this.formData.classes = []
      this.selectTables = []
    }
  }
}
</script>

<style lang="scss" scoped>
.baseMulClassAnalyseBtn {
  display: inline-block;
}
</style>
