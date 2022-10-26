<template>
  <div class="base-class-setting">
    <el-form
      ref="form"
      :model="formData"
      inline
      label-position="left"
      :rules="rules"
    >
      <el-form-item label="班级:" prop="className">
        <el-select
          v-model="formData.className"
          placeholder="请选择"
          filterable
          @change="changeHandle"
        >
          <el-option
            v-for="item in classMap"
            :key="item.value"
            :label="item.value"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { classMap } from '@/constant/subject'
export default {
  name: 'BaseClassSetting',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  computed: {
    tables() {
      return this.$store.state.tables
    },
    curIndex() {
      return this.$store.state.curIndex
    }
  },
  watch: {
    value: {
      handler(val) {
        this.formData.className = val || ''
      },
      immediate: true
    }
  },
  data() {
    return {
      classMap,
      formData: {
        className: ''
      },
      rules: {
        className: [{ required: true, message: '请设置班级' }]
      }
    }
  },
  methods: {
    changeHandle(val) {
      this.$emit('input', val)
      this.tables[this.curIndex].className = val
      this.$store.commit('setTables', this.tables)
    },
    async validate() {
      return await this.$refs.form.validate()
    }
  }
}
</script>

<style lang="scss" scoped>
.base-class-setting {
  ::v-deep {
    .el-form-item--mini.el-form-item,
    .el-form-item--small.el-form-item {
      margin-bottom: 0px;
    }
  }
}
</style>
