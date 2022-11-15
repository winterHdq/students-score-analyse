<template>
  <el-dialog
    v-if="dialogVisible"
    class="sort-dialog"
    :visible.sync="dialogVisible"
    title="科目分析"
    width="80%"
    top="5vh"
    @close="onClose"
    :close-on-click-modal="false"
  >
    <sort-template
      :tableId="curTable.id"
      :isDialog="true"
      @onAddTable="onClose"
    ></sort-template>
  </el-dialog>
</template>
<script>
import baseMixin from './base/baseMixin'
import SortTemplate from './template/sortTemplate'
export default {
  name: 'SortDialog',
  components: { SortTemplate },
  mixins: [baseMixin],
  props: {
    curTable: {
      type: Object,
      require: true
    }
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  created() {
    this.dialogVisible = true
  },
  computed: {},
  methods: {
    onClose() {
      this.$emit('onClose')
    }
  }
}
</script>

<style lang="scss" scoped>
.sort-dialog {
}
</style>
