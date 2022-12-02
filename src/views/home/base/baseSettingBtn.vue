<template>
  <div class="baseSettingBtn">
    <el-link @click="dialogVisiable = !dialogVisiable">
      <i class="el-icon-setting btn" id="baseSettingBtn"></i>
    </el-link>
    <el-dialog
      title="设置"
      :visible.sync="dialogVisiable"
      width="30%"
      :close-on-click-modal="false"
    >
      <base-class-setting
        v-model="className"
        label="默认班级"
      ></base-class-setting>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisiable = false">取 消</el-button>
        <el-button type="primary" @click="onSave">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import BaseClassSetting from './baseClassSetting'
import baseMixin from './baseMixin'
export default {
  name: 'BaseTemplateBtn',
  mixins: [baseMixin],
  components: {
    BaseClassSetting
  },
  data() {
    return {
      className: '',
      dialogVisiable: false
    }
  },
  computed: {
    defaultClassName() {
      return this.$store.state.defaultClassName
    }
  },
  created() {
    this.className = this.defaultClassName
  },
  methods: {
    onSave() {
      this.$store.commit('setDefaultClassName', this.className)
      this.$message.success('设置成功')
      this.dialogVisiable = false
    }
  }
}
</script>

<style lang="scss" scoped>
.baseSettingBtn {
  display: inline-block;
  margin: auto 10px;
  .btn {
    font-size: 25px;
    color: #fff;
  }
  ::v-deep {
    .base-class-setting .el-form-item--mini .el-form-item__content,
    .base-class-setting .el-form-item--mini .el-form-item__label {
      color: #000;
    }
  }
}
</style>
