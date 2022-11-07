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
          <span v-for="(item, index) in formData.classes" :key="item.id">
            {{ item.name }}【{{ item.className || '未知' }}】
            <span v-if="index !== formData.classes.length - 1">、</span>
            <!-- <el-link :underline="false" icon="el-icon-d-arrow-left" @click=""></el-link> -->
          </span>
        </div>
      </el-form>
      <span slot="footer">
        <el-button type="primary" @click="onSave">确定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="年段分析"
      :visible.sync="tableDialog"
      v-if="tableDialog"
      width="80%"
      top="10vh"
    >
      <total-sort-template
        :classes="formData.classes.map(item => item.id)"
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
import { isRepeat } from '@/common/utils'
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
      rules: {
        name: [{ required: true, message: '请输入' }],
        classes: [{ required: true, message: '请选择' }]
      }
    }
  },
  methods: {
    async onSave() {
      try {
        await this.$refs.form.validate()
        let res = this.formData.classes.find(item => !item.className)
        if (res) {
          this.$message.error(`请设置【${res.name}】的班级`)
          return false
        }
        if (isRepeat(this.formData.classes.map(item => item.className))) {
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
    }
  }
}
</script>

<style lang="scss" scoped>
.baseMulClassAnalyseBtn {
  display: inline-block;
}
</style>
