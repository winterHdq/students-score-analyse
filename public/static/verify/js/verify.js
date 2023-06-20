(function ($, window, document, undefined) {
  // 原图大小
  var verifyInitConfig = {
    // 底图
    imgSize: {
      width: '320px',
      height: '240px'
    },
    // 滑块图
    blockSize: {
      width: '50px',
      height: '240px'
    }
  };
  function wrapHtmlTemplate(size) {
    return (
      '<div class="mask"></div>' +
      '<div class="verify-dialog"><div class="verifybox" style="width:' +
      (parseInt(size.img_width) + 30) +
      'px">' +
      '<div class="verifybox-top">' +
      '请完成安全验证' +
      '<span class="verifybox-close">' +
      '<i class="iconfont icon-close"></i>' +
      '</span>' +
      '</div>' +
      '<div class="verifybox-content" style="padding:15px">' +
      '<div style="position: relative;">'
    );
  }
  //定义Slide的构造函数
  var Slide = function (ele, opt) {
    this.$element = ele;
    this.moveLeftDistance = 0;
    this.defaults = {
      captchaType: 'blockPuzzle',
      backImg: '',
      sliderBackImg: '',
      secretKey: '',
      mode: 'pop', //弹出式pop，固定fixed
      vSpace: 5,
      explain: '向右滑动完成验证',
      imgSize: {
        width: verifyInitConfig.imgSize.width,
        height: verifyInitConfig.imgSize.height
      },
      circleRadius: '10px',
      barSize: {
        width: verifyInitConfig.imgSize.width,
        height: '30px'
      },
      ready: function () {},
      validate: function () {},
      refresh: function () {},
      success: function () {},
      error: function () {},
      close: function () {}
    };
    this.options = $.extend({}, this.defaults, opt);
  };
  //定义Slide的方法
  Slide.prototype = {
    init: function () {
      var _this = this;
      //加载页面
      this.loadDom();
      _this.refresh();
      this.options.ready();
      this.$element[0].onselectstart = document.body.ondrag = function () {
        return false;
      };
      if (this.options.mode == 'pop') {
        _this.$element.find('.verifybox-close').on('click', function () {
          _this.close();
        });
      }
      document.addEventListener('touchmove',function(e){
        e.preventDefault()
      },{
        passive: false
      })
      //按下
      this.htmlDoms.move_block.on('touchstart', function (e) {
        e.preventDefault()
        e.stopPropagation();
        _this.start(e);
      });
      this.htmlDoms.move_block.on('mousedown', function (e) {
        e.stopPropagation();
        _this.start(e);
      });
      this.htmlDoms.sub_block.on('mousedown', function (e) {
        e.stopPropagation();
      });
      this.$element.on('touchmove', function (e) {
        e.preventDefault()
        e.stopPropagation();
        _this.move(e);
      },{
        passive: false
      });
      this.$element.on('mousemove', function (e) {
        e.stopPropagation();
        _this.move(e);
      });
      this.$element.on('touchend', function (e) {
        e.preventDefault()
        e.stopPropagation();
        _this.end();
      });
      this.$element.on('mouseup', function (e) {
        e.stopPropagation();
        _this.end();
      });
      //拖动
      // window.addEventListener("touchmove", function(e) {
      // 	_this.move(e);
      // });
      // window.addEventListener("mousemove", function(e) {
      // 	_this.move(e);
      // });
      // //鼠标松开
      // window.addEventListener("touchend", function() {
      // 	_this.end();
      // });
      // window.addEventListener("mouseup", function() {
      // 	_this.end();
      // });
      // //刷新
      _this.$element.find('.verify-refresh').on('click', function () {
        _this.refresh(true);
      });
    },
    //初始化加载
    loadDom: function () {
      this.status = false; //鼠标状态
      this.isEnd = false; //是够验证完成
      this.setSize = this.resetSize(this); //重新设置宽度高度
      this.plusWidth = 0;
      this.plusHeight = 0;
      this.x = 0;
      this.y = 0;
      var panelHtml = '';
      if (this.options.mode == 'pop') {
        panelHtml = wrapHtmlTemplate(this.setSize);
      }
      panelHtml +=
        '<div class="verify-img-out">' +
        '<div class="verify-img-panel">' +
        '<div class="verify-loading">正在努力加载中...</div>' +
        '<div class="verify-refresh">' +
        '<i class="iconfont icon-refresh"></i>' +
        '</div>' +
        '<span class="verify-tips"  class="suc-bg"></span>' +
        '<img src="" class="backImg" style="width:100%;height:100%;display:block">' +
        '</div>' +
        '</div>';
      panelHtml +=
        '<div class="verify-bar-area" style="width:' +
        this.setSize.img_width +
        ',height:' +
        this.setSize.bar_height +
        ',line-height:' +
        this.setSize.bar_height +
        '">' +
        '<span  class="verify-msg">' +
        this.options.explain +
        '</span>' +
        '<div class="verify-left-bar">' +
        '<div  class="verify-move-block">' +
        '<i  class="verify-icon iconfont icon-right"></i>' +
        '<div class="verify-sub-block">' +
        '<img src="" class="slider-backImg" alt=""  style="width:100%;height:100%;display:block">' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
      wrapEndHtml = '</div></div></div></div>';
      if (this.options.mode == 'pop') {
        panelHtml += wrapEndHtml;
      }
      this.$element.append(panelHtml);
      this.htmlDoms = {
        tips: this.$element.find('.verify-tips'),
        sub_block: this.$element.find('.verify-sub-block'),
        out_panel: this.$element.find('.verify-img-out'),
        img_panel: this.$element.find('.verify-img-panel'),
        bar_area: this.$element.find('.verify-bar-area'),
        move_block: this.$element.find('.verify-move-block'),
        left_bar: this.$element.find('.verify-left-bar'),
        msg: this.$element.find('.verify-msg'),
        icon: this.$element.find('.verify-icon'),
        refresh: this.$element.find('.verify-refresh'),
        loading: this.$element.find('.verify-loading')
      };
      this.$element.css('position', 'relative');
      this.htmlDoms.sub_block.css({
        height: this.setSize.block_height,
        width: this.setSize.block_width,
        top: -(parseInt(this.setSize.img_height) + this.options.vSpace) + 'px'
      });
      this.htmlDoms.out_panel.css(
        'height',
        parseInt(this.setSize.img_height) + this.options.vSpace + 'px'
      );
      this.htmlDoms.img_panel.css({
        width: this.setSize.img_width,
        height: this.setSize.img_height
      });
      this.htmlDoms.bar_area.css({
        width: this.setSize.img_width,
        height: this.setSize.bar_height,
        'line-height': this.setSize.bar_height
      });
      this.htmlDoms.move_block.css({
        width: this.setSize.bar_height,
        height: this.setSize.bar_height
      });
      this.htmlDoms.left_bar.css({
        width: this.setSize.bar_height,
        height: this.setSize.bar_height
      });
    },
    //鼠标按下
    start: function (e) {
      if (!e.originalEvent.targetTouches) {
        //兼容移动端
        var x = e.clientX;
      } else {
        //兼容PC端
        var x = e.originalEvent.targetTouches[0].pageX;
      }
      this.startLeft = Math.floor(
        x - this.htmlDoms.bar_area[0].getBoundingClientRect().left
      );
      this.startMoveTime = new Date().getTime();
      if (this.isEnd == false) {
        this.htmlDoms.msg.text('');
        this.htmlDoms.move_block.css('background-color', '#337ab7');
        this.htmlDoms.left_bar.css('border-color', '#337AB7');
        this.htmlDoms.icon.css('color', '#fff');
        e.stopPropagation();
        this.status = true;
      }
    },
    //鼠标移动
    move: function (e) {
      if (this.status && this.isEnd == false) {
        if (!e.originalEvent.targetTouches) {
          //兼容移动端
          var x = e.clientX;
        } else {
          //兼容PC端
          var x = e.originalEvent.targetTouches[0].pageX;
        }
        var bar_area_left =
          this.htmlDoms.bar_area[0].getBoundingClientRect().left;
        var move_block_left = x - bar_area_left - this.startLeft; //小方块相对于父元素的left值
        if (move_block_left < 0) {
          move_block_left = 0;
        }
        var block_width = this.htmlDoms.sub_block[0].offsetWidth;
        var bar_height_num = parseInt(this.setSize.bar_height);
        var bar_width_num = parseInt(this.setSize.bar_width);
        if (move_block_left + bar_height_num > bar_width_num) {
          move_block_left = bar_width_num - bar_height_num;
        }
        var sub_block_left =
          -((block_width - bar_height_num) / parseInt(this.setSize.img_width)) *
          move_block_left;

        //拖动后小方块的left值
        this.htmlDoms.move_block.css('left', move_block_left + 'px');
        this.htmlDoms.left_bar.css('width', move_block_left + 'px');
        this.htmlDoms.sub_block.css('left', sub_block_left + 'px');
        this.moveLeftDistance = move_block_left + parseInt(sub_block_left);
      }
    },
    //鼠标松开
    end: function () {
      this.endMovetime = new Date().getTime();
      var _this = this;
      //判断是否重合
      if (this.status && this.isEnd == false) {
        this.moveLeftDistance =
          (this.moveLeftDistance * parseInt(verifyInitConfig.imgSize.width)) /
          parseInt(this.setSize.img_width);
        //图片滑动

        var data = {
          captchaType: this.options.captchaType,
          pointJson: this.options.secretKey
            ? aesEncrypt(
                JSON.stringify({ x: this.moveLeftDistance, y: 5.0 }),
                this.options.secretKey
              )
            : JSON.stringify({ x: this.moveLeftDistance, y: 5.0 })
        };
        _this.htmlDoms.refresh.hide();
        _this.htmlDoms.loading.show();
        _this.options.validate(data, function (res) {
          // 请求成功
          if (res.success) {
            _this.htmlDoms.move_block.css('background-color', '#5cb85c');
            _this.htmlDoms.left_bar.css({
              'border-color': '#5cb85c',
              'background-color': '#fff'
            });
            _this.htmlDoms.icon.css('color', '#fff');
            _this.htmlDoms.icon.removeClass('icon-right');
            _this.htmlDoms.icon.addClass('icon-check');
            //提示框
            _this.htmlDoms.tips.addClass('suc-bg').removeClass('err-bg');
            _this.htmlDoms.tips.css({
              display: 'block',
              animation: 'move 1s cubic-bezier(0, 0, 0.39, 1.01)'
            });
            _this.htmlDoms.tips.animate({ bottom: '0px' });
            _this.htmlDoms.tips.text(
              ((_this.endMovetime - _this.startMoveTime) / 1000).toFixed(2) +
                '验证成功'
            );
            setTimeout(function () {
              _this.success();
            }, 500);
          } else {
            _this.htmlDoms.move_block.css('background-color', '#d9534f');
            _this.htmlDoms.left_bar.css('border-color', '#d9534f');
            _this.htmlDoms.icon.css('color', '#fff');
            _this.htmlDoms.icon.removeClass('icon-right');
            _this.htmlDoms.icon.addClass('icon-close');

            _this.htmlDoms.tips.addClass('err-bg').removeClass('suc-bg');
            _this.htmlDoms.tips.css({
              display: 'block',
              animation: 'move 1.3s cubic-bezier(0, 0, 0.39, 1.01)'
            });
            _this.htmlDoms.tips.animate({ bottom: '0px' });
            _this.htmlDoms.tips.text(res.msg + '，请刷新重试');
            _this.options.error(this);
          }
          _this.htmlDoms.move_block
            .find('.verify-icon')
            .css('cursor', 'not-allowed');
          _this.isEnd = true;
          _this.htmlDoms.loading.hide();
          _this.htmlDoms.refresh.show();
        });
        this.status = false;
      }
    },
    resetSize: function (obj) {
      var img_width,
        img_height,
        bar_width,
        bar_height,
        block_width,
        block_height,
        circle_radius; //图片的宽度、高度，移动条的宽度、高度
      var parentWidth = obj.$element.parent().width() || $(window).width();
      var parentHeight = obj.$element.parent().height() || $(window).height();

      if (obj.options.imgSize.width.indexOf('%') != -1) {
        img_width =
          (parseInt(obj.options.imgSize.width) / 100) * parentWidth + 'px';
      } else {
        img_width = obj.options.imgSize.width;
      }

      if (obj.options.imgSize.height.indexOf('%') != -1) {
        img_height =
          (parseInt(obj.options.imgSize.height) / 100) * parentHeight + 'px';
      } else {
        img_height = obj.options.imgSize.height;
      }

      if (obj.options.barSize.width.indexOf('%') != -1) {
        bar_width =
          (parseInt(obj.options.barSize.width) / 100) * parentWidth + 'px';
      } else {
        bar_width = obj.options.barSize.width;
      }

      if (obj.options.barSize.height.indexOf('%') != -1) {
        bar_height =
          (parseInt(obj.options.barSize.height) / 100) * parentHeight + 'px';
      } else {
        bar_height = obj.options.barSize.height;
      }

      block_width =
        Math.floor(
          (parseInt(img_width) * parseInt(verifyInitConfig.blockSize.width)) /
            parseInt(verifyInitConfig.imgSize.width)
        ) + 'px';
      block_height = img_height;

      if (obj.options.circleRadius) {
        if (obj.options.circleRadius.indexOf('%') != -1) {
          circle_radius =
            (parseInt(obj.options.circleRadius) / 100) * parentHeight + 'px';
        } else {
          circle_radius = obj.options.circleRadius;
        }
      }

      return {
        img_width: img_width,
        img_height: img_height,
        bar_width: bar_width,
        bar_height: bar_height,
        block_width: block_width,
        block_height: block_height,
        circle_radius: circle_radius
      };
    },
    success: function () {
      this.options.success();
      if (this.options.mode === 'pop') {
        this.close();
      } else {
        refresh(true);
      }
    },
    //刷新
    refresh: function (manual) {
      var _this = this;
      if (manual) {
        this.htmlDoms.refresh.hide();
        this.htmlDoms.loading.show();
        this.options.refresh(
          { captchaType: this.options.captchaType },
          function (res) {
            if (res.success) {
              _this.options.secretKey = res.secretKey;
              _this.options.backImg = res.backImg;
              _this.options.sliderBackImg = res.sliderBackImg;
              _this.refreshHandle();
            } else {
              _this.htmlDoms.tips.text(res.msg + '，请刷新重试');
            }
          }
        );
      } else {
        _this.refreshHandle();
      }
    },
    refreshHandle: function () {
      this.htmlDoms.loading.hide();
      this.htmlDoms.refresh.show();
      this.$element.find('.verify-msg:eq(1)').text('');
      this.$element.find('.verify-msg:eq(1)').css('color', '#000');
      this.htmlDoms.move_block.animate({ left: '0px' }, 'fast');
      this.htmlDoms.left_bar.animate(
        { width: parseInt(this.setSize.bar_height) },
        'fast'
      );
      this.htmlDoms.left_bar.css({ 'border-color': '#ddd' });
      this.htmlDoms.move_block.css({ 'background-color': '#fff' });
      this.htmlDoms.move_block.find('.verify-icon').css({ cursor: 'pointer' });
      this.htmlDoms.icon.css('color', '#000');
      this.htmlDoms.icon.removeClass('icon-close');
      this.htmlDoms.icon.addClass('icon-right');
      this.$element.find('.verify-msg:eq(0)').text(this.options.explain);
      this.isEnd = false;
      this.$element.find('.backImg')[0].src =
        'data:image/png;base64,' + this.options.backImg;
      this.$element.find('.slider-backImg')[0].src =
        'data:image/png;base64,' + this.options.sliderBackImg;
      this.htmlDoms.sub_block.css('left', '0px');
      this.htmlDoms.tips.animate({ bottom: '-35px' });
      this.htmlDoms.tips.animate({
        bottom: '-35px',
        display: 'none',
        animation: 'none'
      });
    },
    close: function () {
      this.options.close();
      this.$element.empty();
    }
  };

  //定义Points的构造函数
  var Points = function (ele, opt) {
    this.$element = ele;
    this.defaults = {
      captchaType: 'clickWord',
      mode: 'pop', //弹出式pop，固定fixed
      secretKey: '',
      backImg: '',
      wordList: [],
      checkNum: 3, //校对的文字数量
      vSpace: 5, //间隔
      imgSize: {
        width: verifyInitConfig.imgSize.width,
        height: verifyInitConfig.imgSize.height
      },
      barSize: {
        width: verifyInitConfig.imgSize.width,
        height: '30px'
      },
      ready: function () {},
      validate: function () {},
      refresh: function () {},
      success: function () {},
      error: function () {},
      close: function () {}
    };
    this.options = $.extend({}, this.defaults, opt);
  };

  //定义Points的方法
  Points.prototype = {
    init: function () {
      var _this = this;
      //加载页面
      _this.loadDom();
      _this.refresh();
      _this.options.ready();
      this.$element[0].onselectstart = document.body.ondrag = function () {
        return false;
      };
      if (this.options.mode == 'pop') {
        _this.$element.find('.verifybox-close').on('click', function () {
          _this.close();
        });
      }
      // 注册点击验证事件
      _this.$element.find('.back-img').on('click', function (e) {
        _this.checkPosArr.push(_this.getMousePos(this, e));
        if (_this.num == _this.options.checkNum) {
          _this.htmlDoms.refresh.hide();
          _this.htmlDoms.loading.show();
          _this.num = _this.createPoint(_this.getMousePos(this, e));
          //按比例转换坐标值
          _this.checkPosArr = _this.pointTransfrom(
            _this.checkPosArr,
            _this.setSize
          );
          setTimeout(function () {
            var data = {
              captchaType: _this.options.captchaType,
              pointJson: _this.options.secretKey
                ? aesEncrypt(
                    JSON.stringify(_this.checkPosArr),
                    _this.options.secretKey
                  )
                : JSON.stringify(_this.checkPosArr)
            };
            _this.options.validate(data, function (res) {
              if (res.success) {
                _this.$element
                  .find('.verify-bar-area')
                  .css({ color: '#4cae4c', 'border-color': '#5cb85c' });
                _this.$element.find('.verify-msg').text('验证成功');
                _this.$element.find('.verify-img-panel').unbind('click');
                setTimeout(function () {
                  _this.success();
                }, 500);
              } else {
                _this.options.error(_this);
                _this.$element
                  .find('.verify-bar-area')
                  .css({ color: '#d9534f', 'border-color': '#d9534f' });
                _this.$element
                  .find('.verify-msg')
                  .text(res.msg + '，请刷新重试');
              }
              _this.htmlDoms.refresh.show();
            });
          }, 400);
        }
        if (_this.num < _this.options.checkNum) {
          _this.num = _this.createPoint(_this.getMousePos(this, e));
        }
      });
      //刷新
      _this.$element.find('.verify-refresh').on('click', function () {
        _this.refresh(true);
      });
    },

    //加载页面
    loadDom: function () {
      this.fontPos = []; //选中的坐标信息
      this.checkPosArr = []; //用户点击的坐标
      this.num = 1; //点击的记数
      var panelHtml = '';
      var wrapHtml = '';
      this.setSize = Slide.prototype.resetSize(this); //重新设置宽度高度
      wrapHtml = wrapHtml = wrapHtmlTemplate(this.setSize);
      if (this.options.mode == 'pop') {
        panelHtml = wrapHtml;
      }
      panelHtml +=
        '<div class="verify-img-out">' +
        '<div class="verify-img-panel">' +
        '<div class="verify-loading">正在努力加载中...</div>' +
        '<div class="verify-refresh">' +
        '<i class="iconfont icon-refresh"></i>' +
        '</div>' +
        '<img src="" class="back-img" width="' +
        this.setSize.img_width +
        '" height="' +
        this.setSize.img_height +
        '">' +
        '</div>' +
        '</div>' +
        '<div class="verify-bar-area" style="width:' +
        this.setSize.img_width +
        ',height:' +
        this.setSize.bar_height +
        ',line-height:' +
        this.setSize.bar_height +
        '">' +
        '<span  class="verify-msg"></span>' +
        '</div>';
      wrapEndHtml = '</div></div></div></div>';
      if (this.options.mode == 'pop') {
        panelHtml += wrapEndHtml;
      }
      this.$element.append(panelHtml);
      this.htmlDoms = {
        back_img: this.$element.find('.back-img'),
        out_panel: this.$element.find('.verify-img-out'),
        img_panel: this.$element.find('.verify-img-panel'),
        bar_area: this.$element.find('.verify-bar-area'),
        msg: this.$element.find('.verify-msg'),
        refresh: this.$element.find('.verify-refresh'),
        loading: this.$element.find('.verify-loading')
      };
      this.$element.css('position', 'relative');
      this.htmlDoms.out_panel.css(
        'height',
        parseInt(this.setSize.img_height) + this.options.vSpace + 'px'
      );
      this.htmlDoms.img_panel.css({
        width: this.setSize.img_width,
        height: this.setSize.img_height,
        'background-size':
          this.setSize.img_width + ' ' + this.setSize.img_height,
        'margin-bottom': this.options.vSpace + 'px'
      });
      this.htmlDoms.bar_area.css({
        width: this.setSize.img_width,
        height: this.setSize.bar_height,
        'line-height': this.setSize.bar_height
      });
    },

    //获取坐标
    getMousePos: function (obj, event) {
      var e = event || window.event;
      var scrollX =
        document.documentElement.scrollLeft || document.body.scrollLeft;
      var scrollY =
        document.documentElement.scrollTop || document.body.scrollTop;
      var x = e.clientX - ($(obj).offset().left - $(window).scrollLeft());
      var y = e.clientY - ($(obj).offset().top - $(window).scrollTop());

      return { x: x, y: y };
    },

    //创建坐标点
    createPoint: function (pos) {
      this.htmlDoms.img_panel.append(
        '<div class="point-area" style="background-color:#1abd6c;color:#fff;z-index:9999;width:20px;height:20px;text-align:center;line-height:20px;border-radius: 50%;position:absolute;' +
          'top:' +
          parseInt(pos.y - 10) +
          'px;left:' +
          parseInt(pos.x - 10) +
          'px;">' +
          this.num +
          '</div>'
      );
      return ++this.num;
    },

    // 验证成功
    success: function () {
      this.options.success();
      if (this.options.mode === 'pop') {
        this.close();
      } else {
        this.refresh(true);
      }
    },

    //刷新
    refresh: function (manual) {
      var _this = this;
      if (manual) {
        this.htmlDoms.refresh.hide();
        this.htmlDoms.loading.show();
        this.options.refresh(
          { captchaType: this.options.captchaType },
          function (res) {
            if (res.success) {
              _this.options.secretKey = res.secretKey;
              _this.options.backImg = res.backImg;
              _this.options.wordList = res.wordList;
              _this.options.checkNum = res.wordList.length;
              _this.refreshHandle();
            } else {
              _this.$element.find('.verify-msg').text(res.msg + '，请刷新重试');
            }
          }
        );
      } else {
        this.refreshHandle();
      }
    },
    refreshHandle: function () {
      this.$element.find('.point-area').remove();
      this.fontPos = [];
      this.checkPosArr = [];
      this.num = 1;
      this.htmlDoms.back_img[0].src =
        'data:image/png;base64,' + this.options.backImg;
      var text = '请依次点击【' + this.options.wordList.join(',') + '】';
      this.$element
        .find('.verify-bar-area')
        .css({ color: '', 'border-color': '' });
      this.$element.find('.verify-msg').text(text);
      this.htmlDoms.refresh.show();
      this.htmlDoms.loading.hide();
    },
    // 坐标转换
    pointTransfrom: function (pointArr, imgSize) {
      var pointLen = pointArr.length;
      var newPointArr = [];
      for (var i = 0; i < pointLen; i++) {
        var p = pointArr[i];
        var x = Math.round(
          (parseInt(verifyInitConfig.imgSize.width) * p.x) /
            parseInt(imgSize.img_width)
        );
        var y = Math.round(
          (parseInt(verifyInitConfig.imgSize.height) * p.y) /
            parseInt(imgSize.img_height)
        );
        newPointArr.push({ x: x, y: y });
      }
      return newPointArr;
    },
    close: function () {
      this.options.close();
      this.$element.empty();
    }
  };
  //在插件中使用slideVerify对象  初始化与是否弹出无关 ,不应该耦合
  $.fn.slideVerify = function (options, callbacks) {
    var slide = new Slide(this, options);
    if (slide.options.mode == 'pop') {
      slide.init();
    } else if (slide.options.mode == 'fixed') {
      slide.init();
    }
  };

  //在插件中使用clickVerify对象
  $.fn.pointsVerify = function (options, callbacks) {
    var points = new Points(this, options);
    if (points.options.mode == 'pop') {
      points.init();
    } else if (points.options.mode == 'fixed') {
      points.init();
    }
  };
})(jQuery, window, document);
