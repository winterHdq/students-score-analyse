// https://www.jianshu.com/p/43ce62773e19
// https://github.com/SheetJS/sheetjs
// sheetjs 中文文档：https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2Frockboom%2FSheetJS-docs-zh-CN
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
    baseExportExcel(table) {
      const book = XLSX2.utils.book_new()
      const sheet = this.sheetHandle(table)
      XLSX2.utils.book_append_sheet(book, sheet)
      const suffixIndex = table.name.lastIndexOf('.')
      const fileName = table.name.slice(0, suffixIndex == -1 ? 99 : suffixIndex)
      XLSX2.writeFile(book, `${fileName}-${table.className || '班级'}.xlsx`)
    },
    // 多表导出
    baseExportMulSheetExcel(table) {
      let res = true
      const book = XLSX2.utils.book_new()
      table.sheets.forEach(item => {
        const sheet = this.sheetHandle(item)
        !sheet && (res = false)
        XLSX2.utils.book_append_sheet(book, sheet, item.name)
      })
      res && XLSX2.writeFile(book, `${table.name}.xlsx`)
    },
    // 工作表处理
    sheetHandle(table) {
      try {
        const sheet = XLSX2.utils.json_to_sheet(table.data)
        // sheet['!cols'] = [{ wch: 10 }, { wch: 5 }]
        const headerLen = table.column.length
        const compaseArr = table.column.filter(item => /进退|差/.test(item))
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
              compaseArr.length,
              compaseArr
            )
          }
        })
        return sheet
      } catch (e) {
        this.$message.error('啊欧，数据出错，导出失败')
        return false
      }
    },
    textColorHandle(key, item, isCompare, compaseArr) {
      try {
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
      } catch (e) {
        console.log(e)
        this.$message.error('样式错误，导出失败')
      }
    }
  }
}

export default baseMixin
