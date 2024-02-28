<template>
  <div class="base-class-setting">
    <el-form
      ref="form"
      :model="formData"
      inline
      label-position="left"
      :rules="rules"
    >
      <el-form-item :label="label" prop="className">
        <el-select
          v-model="formData.className"
          placeholder="请选择"
          filterable
          allow-create
          style="width: 100px"
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
    },
    label: {
      type: String,
      default: '班级'
    }
  },
  computed: {
    tables() {
      return this.$store.state.tables
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
    .el-form-item--mini .el-form-item__content,
    .el-form-item--mini .el-form-item__label {
      color: #fff;
    }
  }
}
</style>
