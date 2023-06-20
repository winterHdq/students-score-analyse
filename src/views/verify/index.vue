<template>
  <div>
    <el-button type="primary" @click="onVerify">验证</el-button>
    <el-slider v-model="value1"></el-slider>
    <div id="verify" tabindex="0"></div>
  </div>
</template>

<script>
// import $ from 'jquery'
export default {
  name: 'verify-demo',
  data() {
    return {
      value1: 0,
      verifyData: {
        wordList: ['测', '试'],
        backImg: null,
        sliderBackImg: null
      }
    }
  },
  mounted() {
    window.addEventListener('mousemove', e => {
      console.log(e.clientX)
      // eslint-disable-next-line no-undef
      $('body').append('1;')
    })
    window.addEventListener('touchmove', () => {
      document.append('1;')
      // $('body').append('1')
    })
  },
  methods: {
    onVerify() {
      this.slideVerify('test', this.verifyData)
    },
    // 文字点验证
    pointsVerify(methodName, verifyData) {
      // eslint-disable-next-line no-undef
      $('#verify').pointsVerify({
        checkNum: verifyData.wordList.length, //校对的文字数量
        backImg: verifyData.backImg,
        wordList: verifyData.wordList || [],
        secretKey: verifyData.secretKey,
        imgSize: {
          width: '400px',
          height: '300px'
        },
        barSize: {
          width: '400px',
          height: '40px'
        },
        validate: function (val, callbacks) {
          callbacks({ success: false })
        },
        refresh: function (val, callbacks) {
          callbacks({ success: true })
        }
      })
    },
    // 滑块验证
    slideVerify(methodName, verifyData) {
      // eslint-disable-next-line no-undef
      // eslint-disable-next-line no-undef
      $('#verify').slideVerify({
        backImg: verifyData.backImg,
        sliderBackImg: verifyData.sliderBackImg,
        secretKey: verifyData.secretKey,
        imgSize: {
          width: '400px',
          height: '300px'
        },
        barSize: {
          width: '400px',
          height: '40px'
        },
        validate: function (val, callbacks) {
          callbacks({ success: false })
        },
        refresh: function (val, callbacks) {
          callbacks({ success: true })
        }
      })
    }
  }
}
</script>

<style></style>
