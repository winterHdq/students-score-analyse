const CryptoJS = require('crypto-js')

const ivWord = '0123456789ABCDEF'
const keyWord = '1234567890ABCDEF1234567890ABCDEF'

// 加密数据函数 工具crypto.js 文件工具
/**
 * @word 要加密的内容
 * @keyWord String  服务器随机返回的关键字
 *  */
function aesEncrypt(word) {
  let iv = CryptoJS.enc.Utf8.parse(ivWord) // 偏移量：一个常量，前后端协定后一个字符串，前后端一致即可
  var key = CryptoJS.enc.Utf8.parse(keyWord)
  var srcs = CryptoJS.enc.Utf8.parse(word)
  var encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.toString()
}
/**
 * 解密
 * @param {*} str
 * @returns
 */
function aesDecrypt(word) {
  let key = CryptoJS.enc.Utf8.parse(keyWord) // 密钥：一个常量，前后端协定后一个字符串即可
  let iv = CryptoJS.enc.Utf8.parse(ivWord) // 偏移量：一个常量，前后端协定后一个字符串，前后端一致即可

  var decrypt = CryptoJS.AES.decrypt(word, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC, // mode 与后台一致。有多个模式可选
    padding: CryptoJS.pad.Pkcs7
  })

  var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
  return decryptedStr.toString()
}

export { aesEncrypt, aesDecrypt }
