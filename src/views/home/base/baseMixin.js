import * as XLSX from 'xlsx/xlsx.mjs'
const baseMixin = {
  data() {
    return {}
  },
  methods: {
    baseExportExcel(table) {
      const book = XLSX.utils.book_new()
      const sheet = XLSX.utils.json_to_sheet(table.data)
      XLSX.utils.book_append_sheet(book, sheet)
      XLSX.writeFile(book, `${table.name}`)
    }
  }
}

export default baseMixin
