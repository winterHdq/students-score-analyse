<template>
  <div class="Test">
    <el-upload
      action=""
      accept="xls,xlsx"
      :auto-upload="false"
      :file-list="fileList"
      :on-change="uploadChangeHandle"
      style="display: inline-block"
    >
      <el-button type="primary">导入</el-button>
    </el-upload>
    <el-button @click="exportExcel">导出</el-button>
    <el-button @click="testExcel">测试导出</el-button>
    <!-- <div>
      <el-input
        v-model="text"
        type="textarea"
        placeholder="请输入需要加解密的文字"
      />
      <p>加密/解密后内容：</p>
      <el-input v-model="encryptText" type="textarea" />
      <el-button type="primary" @click="onEncrypt">aes加密</el-button>
      <el-button type="primary" @click="onDecrypt">aes解密</el-button>
      <el-button type="primary" @click="onBase64Encrypt">base64加密</el-button>
      <el-button type="primary" @click="onBase64Decrypt">base64解密</el-button>
    </div> -->
  </div>
</template>
<script>
// import * as XLSX from 'xlsx/xlsx.mjs'
import { aesEncrypt, aesDecrypt } from '@/common/aes'
import { encode, decode } from 'js-base64'

import XLSX from 'xlsx-js-style'
export default {
  name: 'Test-view',
  components: {},
  mixins: [],
  props: {},
  data() {
    return {
      fileList: [],
      text: '',
      encryptText: '',
      exportArr: [
        ['姓名', '语文'],
        ['小张', 90],
        ['小红', 80]
      ],
      export1Data: [
        {
          姓名: '小张',
          语文: 80
        },
        {
          姓名: '小李',
          语文: 88
        }
      ],
      export2Data: [
        {
          姓名: '小张',
          数学: 95
        },
        {
          姓名: '小李',
          数学: 90
        }
      ]
    }
  },
  created() {},
  mounted() {},
  methods: {
    // 导入
    uploadChangeHandle(file) {
      if (!/\.(xls|xlsx)$/.test(file.name))
        return this.$message.error('上传格式不正确，请上传xls/xlsx文件格式')
      if (!file.raw) return this.$message.error('文件导入失败')
      const reader = new FileReader()
      reader.readAsArrayBuffer(file.raw)
      reader.onload = ev => {
        const data = ev.target.result
        // 解析二进制格式数据
        const workBook = XLSX.read(data, {
          type: 'binary'
        })
        // 获取每张表格数据
        workBook.SheetNames.forEach(name => {
          const tableData = XLSX.utils.sheet_to_json(workBook.Sheets[name])
          console.log(tableData)
        })
      }
    },
    testExcel() {
      const wb = XLSX.utils.book_new()

      // STEP 2: Create data rows and styles
      let row = [
        { v: 'Courier: 24', t: 's', s: { font: { name: 'Courier', sz: 24 } } },
        {
          v: 90,
          t: 'n',
          s: {
            font: { bold: true, color: { rgb: 'FF0000' } },
            alignment: { vertical: 'center', horizontal: 'center' }
          }
        },
        {
          v: 'bold & color',
          t: 's',
          s: {
            font: { bold: true, color: { rgb: 'FF0000' } },
            alignment: { vertical: 'center', horizontal: 'center' }
          }
        },
        {
          v: 'fill: color',
          t: 's',
          s: { fill: { fgColor: { rgb: 'E9E9E9' } } }
        },
        { v: 'line\nbreak', t: 's', s: { alignment: { wrapText: true } } }
      ]

      // STEP 3: Create worksheet with rows; Add worksheet to workbook
      const ws = XLSX.utils.aoa_to_sheet([row])
      XLSX.utils.book_append_sheet(wb, ws, 'readme demo')

      // STEP 4: Write Excel file to browser
      XLSX.writeFile(wb, 'xlsx-js-style-demo.xlsx')
    },
    // 导出
    exportExcel() {
      const wb = XLSX.utils.book_new()
      //   //   header可设置列名顺序
      //   const sheet = XLSX.utils.json_to_sheet(this.export1Data, {
      //     header: ['语文', '姓名']
      //   })
      const sheet2 = XLSX.utils.aoa_to_sheet(this.exportArr)
      //   // 多张
      //   XLSX.utils.book_append_sheet(wb, sheet, '表格1')
      sheet2.B3.s = {
        alignment: {
          vertical: 'center', // 垂直居中
          horizontal: 'center' // 水平居中
        },
        border: {
          top: { style: 'dashDot', color: 'FFCC00' }
        },
        font: {
          name: '宋体',
          sz: 10
        }
      }
      XLSX.utils.book_append_sheet(wb, sheet2, '表格2')
      XLSX.writeFile(wb, `测试表格.xlsx`)
    },
    onEncrypt() {
      if (!this.text) return
      this.encryptText = aesEncrypt(this.text)
    },
    onDecrypt() {
      if (!this.text) return
      this.encryptText = aesDecrypt(this.text)
    },
    onBase64Encrypt() {
      if (!this.text) return
      this.encryptText = encode(this.text)
    },
    onBase64Decrypt() {
      if (!this.text) return
      this.encryptText = decode(this.text)
    }
  }
}
</script>

<style lang="scss" scoped></style>
