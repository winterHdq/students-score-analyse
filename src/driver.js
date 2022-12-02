import Vue from 'vue'
import Driver from 'driver.js'
import 'driver.js/dist/driver.min.css'

Vue.prototype.$driver = new Driver({
  opacity: 0,
  animate: true,
  padding: 5,
  allowClose: false, //禁止点击外部关闭
  doneBtnText: '完成', // 完成按钮标题
  closeBtnText: '跳过', // 关闭按钮标题
  //   stageBackground: '#fff', // 引导对话的背景色
  nextBtnText: '下一步', // 下一步按钮标题
  prevBtnText: '上一步', // 上一步按钮标题
  keyboardControl: true // 允许通过键盘控制（退出关闭，箭头键移动）
})
