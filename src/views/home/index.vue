<template>
  <div class="Excel">
    <div class="btns">
      <el-upload
        action=""
        accept=".xls,.xlsx"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="fileChange"
        style="display: inline-block"
      >
        <el-button size="small" type="primary">点击上传</el-button>
      </el-upload>
      <el-button type="primary" size="small" class="btn" @click="compare">
        进退比较
      </el-button>
    </div>
    <div class="content">
      <div class="left">
        <p
          v-for="item in tables"
          :key="item.index"
          class="name-item"
          :class="{ 'name-item-active': item.id == curTable.id }"
          @click="curTable = item"
        >
          <span>{{ item.name }}</span>
          <el-button
            type="danger"
            @click="exportExcel(item)"
            size="mini"
            class="btn"
          >
            导出
          </el-button>
        </p>
      </div>
      <div class="right">
        <div v-if="curTable.th">
          <div style="padding: 10px">
            <el-button
              v-for="item in subjectMap"
              :key="item.type"
              type="primary"
              size="small"
              class="btn"
              @click="openSortDialog(item.type)"
            >
              {{ item.name }}排位
            </el-button>
          </div>
          <el-table :data="curTable.data" border>
            <el-table-column
              label="序号"
              type="index"
              align="center"
            ></el-table-column>
            <el-table-column
              v-for="item in curTable.th"
              :key="item"
              :label="item"
              :prop="item"
              :fixed="item.indexOf('班级') >= 0 || item == '姓名'"
              sortable
              align="center"
              #default="{ row }"
            >
              <span>{{ row[item] }}</span>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <sort-dialog
      v-if="sortCompareDialog.show"
      :subjectType="sortCompareDialog.type"
      :curTable="curTable"
      @onClose="sortCompareDialog.show = false"
    ></sort-dialog>
  </div>
</template>

<script>
import SortDialog from './sortDialog'
import * as XLSX from 'xlsx/xlsx.mjs'
import setting from './constant'
export default {
  name: 'ExcelView',
  components: { SortDialog },
  data() {
    return {
      tables: [],
      curTable: {},
      subjectMap: setting.subjectMap,
      sortCompareDialog: {
        show: false,
        type: ''
      }
    }
  },
  methods: {
    styleRed(item, key) {
      console.log(item, key)
      let include = setting.subjectMap.map(item => item.name)
      if (include.includes(key)) {
        return { color: 'red' }
      }
      return {}
    },
    fileChange(file) {
      if (!/\.(xls|xlsx)$/.test(file.name))
        return this.$message.error('上传格式不正确，请上传xls/xlsx文件格式')
      if (!file.raw) return this.$message.error('文件导入失败')
      this.importFile(file)
    },
    importFile(file) {
      const reader = new FileReader()
      reader.readAsArrayBuffer(file.raw)
      reader.onload = ev => {
        const data = ev.target.result
        // 解析二进制格式数据
        const workBook = XLSX.read(data, {
          type: 'binary'
        })
        // 获取第一张表数据
        const wsname = workBook.SheetNames[0]
        const tableData = XLSX.utils.sheet_to_json(workBook.Sheets[wsname])
        const curTable = {
          name: file.name,
          data: tableData,
          id: Date.now(),
          th: Object.keys(tableData[0]),
          sortObj: this.sortCompare(tableData)
        }
        this.curTable = curTable
        this.tables.push(curTable)
      }
    },
    importExcel() {
      this.$refs.importInput.click()
    },
    handleImport(e) {
      const files = e.target.files
      if (!files.length) return
      const fileName = files[0].name.toLowerCase()
      if (!/\.(xls|xlsx)$/.test(fileName))
        return this.$message.error('上传格式不正确，请上传xls/xlsx文件格式')
      const fileReader = new FileReader()
      fileReader.onloadend = function () {}
    },
    exportExcel(data) {
      console.log(data)
      const book = XLSX.utils.book_new()
      const sheet = XLSX.utils.json_to_sheet(data.data)
      XLSX.utils.book_append_sheet(book, sheet)
      XLSX.writeFile(book, `${data.name}`)
    },
    compare() {
      let compareTabel = []
      let tab2 = JSON.parse(JSON.stringify(this.tables[0].data))
      let tab2Len = tab2.length
      this.curTable.data.forEach(item => {
        let isName = false
        for (let i = 0; i < tab2Len; i++) {
          if (item['姓名'] == tab2[i]['姓名']) {
            isName = true
            let newItem = {}
            for (let k in item) {
              newItem[k] = item[k]
              if (k !== '姓名' && k.indexOf('名') !== -1 && tab2[i][k]) {
                newItem[`${k}进退`] = 0 - (item[k] - tab2[i][k])
              }
            }
            tab2.splice(i, 1)
            compareTabel.push(newItem)
            tab2Len--
            break
          }
        }
        // 新增人员
        if (!isName) {
          compareTabel.push(item)
        }
      })
      // 删除人员
      tab2.forEach(item => {
        compareTabel.push({
          姓名: item['姓名'],
          班级: item['班级']
        })
      })
      let compare = {
        name: '进退比较.xls',
        data: compareTabel,
        id: Date.now(),
        th: Object.keys(compareTabel[0])
      }
      this.tables.push(compare)
      this.curTable = compare
    },
    sortCompare(list) {
      console.log(list)
      let sortObj = {}
      list.forEach(item => {
        let name = item['姓名']
        for (let k in item) {
          if (k !== '姓名') {
            if (!sortObj[k]) sortObj[k] = []
            sortObj[k].push({
              name: name,
              score: item[k]
            })
          }
        }
      })
      return sortObj
    },
    openSortDialog(type) {
      this.sortCompareDialog.type = type
      this.sortCompareDialog.show = true
    }
  }
}
</script>
<style lang="scss" scoped>
.Excel {
  .btns {
    padding: 20px;
  }
  .btn {
    margin-left: 10px;
  }
  .content {
    display: flex;
    .left {
      width: 200px;
      border-right: 1px solid;
      font-size: 14px;
      flex-shrink: 0;
      border-top: 1px solid;
      .name-item {
        padding: 10px;
        border-bottom: 1px solid;
        cursor: pointer;
      }
      .name-item-active {
        background-color: #7f9bff;
        color: #fff;
      }
    }
    .right {
      flex: 1;
      border-top: 1px solid;
    }
  }
}
</style>
