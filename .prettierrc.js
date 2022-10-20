// 参考：https://www.prettier.cn/docs/options.html
module.exports = {
  semi: false, //结尾分号
  singleQuote: true, //单引号
  endOfLine: 'auto', //维护现有的行尾,CR和CRLF都可
  arrowParens: 'avoid', //单个箭头函数参数周围包括括号:x => x, no (x) => x
  trailingComma: 'none', //尽可能以多行逗号分隔的语法结构打印尾部逗号
  htmlWhitespaceSensitivity: 'ignore' //所有标记周围的空白（或缺少空白）被视为无关紧要
}
