// sheetjs中文文档：https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2Frockboom%2FSheetJS-docs-zh-CN
// import * as XLSX from 'xlsx/xlsx.mjs'
// npm参考：https://www.npmjs.com/package/xlsx-js-style/v/1.2.0
// 例子参考：https://blog.csdn.net/qq_36512842/article/details/116013588
import XLSX2 from 'xlsx-js-style'
const baseMixin = {
  data() {
    return {}
  },
  computed: {
    subjectObj() {
      return this.$store.getters.subjectObj
    }
  },
  methods: {
    baseExportExcel(table, isCompare = false) {
      const book = XLSX2.utils.book_new()
      const sheet = this.sheetHandle(table, isCompare)
      XLSX2.utils.book_append_sheet(book, sheet)
      const suffixIndex = table.name.lastIndexOf('.')
      const fileName = table.name.slice(0, suffixIndex == -1 ? 99 : suffixIndex)
      XLSX2.writeFile(book, `${fileName}-${table.className || '班级'}.xlsx`)
    },
    // 多表导出
    baseExportMulSheetExcel(tables, isCompare = false) {
      const book = XLSX2.utils.book_new()
      tables.forEach(table => {
        const sheet = this.sheetHandle(table, isCompare)
        XLSX2.utils.book_append_sheet(book, sheet, table.name)
      })
      XLSX2.writeFile(book, `分表.xlsx`)
    },
    // 工作表处理
    sheetHandle(table, isCompare) {
      const sheet = XLSX2.utils.json_to_sheet(table.data)
      const headerLen = table.column.length
      const compaseArr = table.column.filter(item => item.indexOf('进退') > 0)
      Object.keys(sheet).forEach((key, index) => {
        if (key.indexOf('!') < 0) {
          sheet[key].s = {
            alignment: {
              vertical: 'center', // 垂直居中
              horizontal: 'center' // 水平居中
            },
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            },
            font: {
              name: '宋体',
              sz: 10
            }
          }
          this.textColorHandle(
            table.column[index % headerLen],
            sheet[key],
            isCompare,
            compaseArr
          )
        }
      })
      return sheet
    },
    textColorHandle(key, item, isCompare, compaseArr) {
      const val = item.v
      if (isCompare) {
        if (compaseArr.includes(key) && val < 0) {
          item.s.font.color = { rgb: 'FF0000' }
        }
      } else {
        if (this.subjectObj[key] && val < this.subjectObj[key].passScore) {
          item.s.font.color = { rgb: 'FF0000' }
        }
      }
    }
  }
}

export default baseMixin
