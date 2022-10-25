<template>
  <div class="baseTemplateBtn">
    <el-button
      type="success"
      size="small"
      @click="dialogVisiable = !dialogVisiable"
    >
      模板
    </el-button>
    <el-dialog title="模板" :visible.sync="dialogVisiable" width="80%">
      <table class="table" border>
        <th v-for="item in column" :key="item">{{ item }}</th>
      </table>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'BaseTemplateBtn',
  data() {
    return {
      column: ['班级', '姓名', '语文', '语名', '数学', '数名'],
      dialogVisiable: false
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.baseTemplateBtn {
  display: inline-block;
}
</style>
