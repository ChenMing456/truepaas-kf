window.onload = function() {
  var hichat = new HiChat();
  hichat.init();
};
var HiChat = function() {
  this.socket = null;
  this.username = null;
  this.userId = null;
  this.role = 'user';
  this.toid = null;
  this.roomid = null;
  this.historyMsg = [];
};
HiChat.prototype = {
  init: function() {

    //解决滚动条失灵
    $('.Truepaas-history').hide();
    var that = this;
    this.socket = io.connect();
    // 判断同一个人第几次打开页面
    if (localStorage.count) {
      localStorage.count = Number(localStorage.count) + 1;
      that.userId = localStorage._id;
      // this.roomid = localStorage._id;
    } else {
      localStorage.count = 1;
      that.userId = Math.random().toString(36).substr(2);
      localStorage._id = that.userId;
    }
    console.log('localStorage._id：' + localStorage.count + '  ' + localStorage._id);
    // $.ajax({
    //   type: 'POST',
    //   url: '/admin/allLeaveMsg',
    //   data: {
    //     toid: that.userId
    //   },
    //   success: function(data) {
    //     console.log("客服留言:" + data);
    //     for (var item of data) {
    //       console.log('item' + item);
    //       that.displayNewMsg(item);
    //     }
    //   }
    // });
    var obj = {
      fromid: that.userId,
      role: 'user'
    };
    this.socket.emit('connect', obj);
    this.socket.emit('userJoin', obj);
    this.socket.on('newRoom', function(obj) {
      console.log('user的newRoom:' + JSON.stringify(obj));
      that.roomid = obj.roomid;
      //localStorage.roomid = obj.roomid;
      if(obj.fromid){
        that.toid = obj.fromid;
      } 
    });
    this.socket.on('connect', function() {
      console.log('user的connect');
    });
    this.socket.on('newMsg', function(obj) {
      console.log('user的newMsg' + obj.msg);
      // 如果发送的是图片
      if (obj.msg.indexOf('/upload/') > -1) {
        console.log('图片信息！');
        that.displayImage(obj);
      } else {
        var Msg = {
          fromid: obj.fromid,
          toid: obj.toid,
          msg: obj.msg,
          roomid: obj.roomid
        };
        console.log('文字信息！');
        that.displayNewMsg(obj);
      }
    });

  // 点击外层聊天图标
    $('#icon_chatLogo').click(function() {
    
      $('.chat_wrap').removeClass('animated slideOutRight').show().addClass('animated slideInRight');
    });
    // 点击叉叉关闭图标
    $('.icon_cancelLogo').click(function() {
      $('.chat_wrap').removeClass('animated slideInRight').addClass('animated slideOutRight');
      localStorage.roomid =null;
    });


    //点击返回按钮 历史消息显示
    $('.icon_setLogo').on('click', function() {
      console.log('localStorage._id：' + that.userId);
      // 每次先清空历史消息
      $('.Truepaas-history').html('');
      // $.ajax({
      //   type: 'POST',
      //   url: '/admin/msgUp',
      //   data: {
      //     toid: this.userId,
      //     _status: 1
      //   },
      //   success: function(data) {
      //     console.log('update留言状态:' + res);
      //   }
      // });

      $.ajax({
        type: 'post',
        url: '/getMsg',
        data: {
          tmp: that.userId
        },
        success: function(data) {
          // that.historyMsg = data;
          // console.log("historyMsg:"+data);
          data.forEach(function(item) {
            if (item.msg.indexOf('\/upload\/') > -1) {
              that.displayImage(item, $('.Truepaas-history'));
            } else {
              that.displayNewMsg(item, $('.Truepaas-history'));
            }
          });

        }
      });

      // js控制hide和show
      $('.Truepaas-history').show();
      $('.writeMsg').show();
      // 返回按钮隐藏 主体消息区隐藏 下面输入消息区隐藏 表情区隐藏
      $('#emojiWrapper').hide();
      $('.icon_setLogo').hide();
      $('.historyMsg').hide();
      $('.footer_msg').hide();
      $('.animateShowFooter').removeClass('animated bounceInUp');
      // 头部变换名字
      $('.header_text p').text('TruePaaS');
    });
    // 点击新消息按钮就显示新消息页面
    $('.writeMsg').on('click', function() {

      $('.Truepaas-history').hide();
      $('.writeMsg').hide();
      $('.icon_setLogo').show();
      $('.historyMsg').show();
      $('.footer_msg').show();
      $('.animateShowFooter')
        .addClass('animated bounceInUp');
      $('.header_text p').text('新消息');
    });

    var newMsg = [],
      msg;
    // 文本域自增高度
    $('#textarea_text').on('keyup keydown', function(event) {
      var nowElem = $('#textarea_text'),
        _val = nowElem.val();
      if (_val.length >= 200) {
        nowElem.val(_val.substring(0, 200));
      }
      $('.expandingArea span').html($(this).val());
      // 输入消息点击回车发送消息
      if (event.keyCode == 13) {
        var obj = {
          fromid: that.userId,
          toid: that.toid,
          msg: null,
          role: 'user',
          roomid: that.roomid,
          msgStatus: 0
        };
        // 如果不全是空格就发送
        if ($(this).val().trim()) {
          msg = $(this).val();
          msg = that.showEmoji(msg);
          obj.msg = msg;
          var url = '/addMessage';
          console.log('this.roomid：' + that.roomid);
          if (!that.roomid) {
            that.socket.emit('postMsg', obj);
            that._post(url, obj);
            console.log('发送的留言');
          } else {
            obj.msgStatus = 1;
            that.socket.emit('private_msg', obj);
            that._post(url, obj);
            console.log('发送的私信');
          }
          that.displayNewMsg(obj);
          $(this).val('').focus();
          event.returnValue = false;
          return false;
        } else {
          return false;
        }
      }
    });

    // 监视发送图片按钮的变化
    // document.getElementById('photoLogo').onchange = function() {
    //   if (this.files.length != 0) {
    //     var file = this.files[0],
    //       reader = new FileReader();
    //     if (!reader) {
    //       that.displayNewMsg('抱歉！您的浏览器不支持读文件，请升级！');
    //       this.value = '';
    //       return;
    //     };
    //     reader.onload = function(e) {
    //       this.value = '';
    //       that.displayImage(e.target.result);
    //     };
    //     // 将图片作为base-64解析
    //     reader.readAsDataURL(file);
    //   }
    // };
    that.initialEmoji();
    // 点击表情按钮就显示表情
    $('#emojiLogo').on('click', function(event) {
      event.stopPropagation();
      $('#emojiWrapper').removeClass('animated bounceOutDown').show().addClass('animated bounceInUp');
    });
    // 点击其它地方关闭
    document.body.onclick = function(e) {
      var emojiWrap = document.getElementById('emojiWrapper');
      if (e.target != emojiWrap) {
        $('#emojiWrapper').removeClass('animated bounceInUp').addClass('animated bounceOutDown');
      }
    };
    // 点击每一个表情 在输入框显示相应的字符
    document.getElementById('emojiWrapper').onclick = function(e) {
      var target = e.target;
      if (target.nodeName == 'IMG') {
        var messageInput = document.getElementById('textarea_text');
        messageInput.focus();
        messageInput.value += `[emoji:${target.title}]`;
      }
    };
    // $('#upload_img').onchange = function(){
    //   var form = document.getElementById('upload_img');
    //   var formdata = new FormData(form);
    //   formdata.append('img',document.getElementById('upload_img'));
    //   $.ajax({
    //        url: '/workorder',
    //        type: 'POST',
    //        data: formdata,
    //        cache: false,
    //        contentType: false,
    //        processData: false,
    //        success: function(data){
    //          console.log('工单发送成功！')
    //        }
    //    });
    //  }


   
    // var newMsg = [],
    //   msg;
    // 文本域自增高度
    // $('#textarea_text').on('keyup keydown', function(event) {
    //   $('.expandingArea span').html($(this).val());
    //   // 输入消息点击回车发送消息
    //   if (event.keyCode == 13) {
    //     // 如果不全是空格就发送
    //     if ($(this).val().trim()) {
    //       msg = $(this).val();
    //       msg = that.showEmoji(msg);
    //       that.displayNewMsg(msg);
    //       newMsg.push($(this).val());
    //       $(this).val('').focus();
    //       event.returnValue = false;
    //       return false;
    //     } else {
    //       return false;
    //     }
    //   }
    // });


    // 监视发送图片按钮的变化
    document.getElementById('photoLogo').onchange = function() {
      var obj = {
        fromid: that.userId,
        toid: that.toid,
        msg: null,
        role: 'user',
        roomid: that.roomid,
        msgStatus: 0
      };
      var ff = document.getElementById('editfile');
      var formdata = new FormData(ff);
      //第一个ajax 是将图片用流写入服务器中，第二个ajax 将返回的图片地址存入数据库中
      $.ajax({
        url: '/upload',
        type: 'POST',
        data: formdata,
        cache: false,
        contentType: false,
        processData: false,
        success: function(data) {
          console.log('data：' + data);
          obj.msg = data;
          that.displayImage(obj);
          console.log('data：' + JSON.stringify(obj));
          $.ajax({
            url: '/addMessage',
            type: 'POST',
            data: {
              data: obj
            },
            success: function(data) {
              console.log('发送成功!' + JSON.stringify(data));
              if (!that.roomid) {
                that.socket.emit('postMsg', data);
                console.log('发送的留言');
              } else {
                data.msgStatus = 1;
                that.socket.emit('private_msg', data);
                console.log('发送的私信');
              }
            },
            error: function() {}
          });
        },
        error: function() {}
      });
    };

    //提交工单
    $('#workOrder-sub').click(function(event) {
      event.preventDefault();
      var form = document.getElementById('workorder');
      var formdata = new FormData(form);
      $.ajax({
        url: '/workorder',
        type: 'POST',
        data: formdata,
        cache: false,
        contentType: false,
        processData: false,
        success: function(data) {
          console.log('工单发送成功！' + data);
        }
      });
    });

    // 点击表情按钮就显示表情
    // $('#emojiLogo').on('click', function(event) {
    //   event.stopPropagation();
    //   $('#emojiWrapper').removeClass('animated bounceOutDown').show().addClass('animated bounceInUp');
    // });
    // 点击其它地方关闭
    // document.body.onclick = function(e) {
    //   var emojiWrap = document.getElementById('emojiWrapper');
    //   if (e.target != emojiWrap) {
    //     $('#emojiWrapper').removeClass('animated bounceInUp').addClass('animated bounceOutDown');
    //   }
    // };
    // 点击表情就在输入框显示
    // document.getElementById('emojiWrapper').onclick = function(e) {
    //   var target = e.target;
    //   if (target.nodeName == 'IMG') {
    //     var messageInput = document.getElementById('textarea_text');
    //     messageInput.focus();
    //     messageInput.value += `[emoji:${target.title}]`;
    //   }
    // };

    // 工单中的上传图片
    function upload_img() {
      if (this.files.length != 0) {
        var file = this.files[0],
          reader = new FileReader();
        if (!reader) {
          alert('你的浏览器不支持读文件，请升级！');
          return;
        };
        reader.onload = function(e) {
          var pic = document.getElementById("preview");
          var picLink = document.getElementById("previewLink");
          picLink.href = this.result;
          picLink.target = '_blank';
          pic.src = this.result;
        };
        reader.readAsDataURL(file);
        // this.value = '';

      }
    }
    document.getElementById('upload_img').onchange = function() {
      upload_img.bind(this)();
    };

    // init结束
  },
  // 展示消息和表情的函数
  displayNewMsg: function(obj, elem) {
    // 通过处理之后的msg
    // msg = this.showEmoji(msg);
    var msg = obj.msg;
    if (!elem) {
      var container = $('.historyMsg');
    } else {
      var container = elem;
    }
    console.log('container：' + container);
    data = new Date().toTimeString().substr(0, 8);
    // 消息显示的模板
    // 判断消息是来自客服还是自己
    if (obj.fromid === this.userId) {
      var msgToDisplay = $(`<div class="newmsgWrap clearfix">
<div id='allNewmsg' class="newcusMsg">
              <span>${msg}</span>
              <p class="shoWDate">${data}</p>
            </div>

          </div>`);
    } else {
      var msgToDisplay = $(`<div class="newmsgWrap clearfix">
      <img class='kefu-photo' src='/img/kefu/1.png' />
            <div id='allNewmsg' class="newserMsg">
              <span>${msg}</span>
              <p class="shoWDate">${data}</p>
            </div>

          </div>`);
    }

    // 等页面全部渲染之后再改变滚动条位置
    setTimeout(function() {
      container.scrollTop(container[0].scrollHeight);
      if ($('.icon-tianxie').length > 0) {
        //点击工单弹出工单填写页面
        $('.icon-tianxie').on('click', function() {
          $('.workOrder-wrap').removeClass('animated bounceOutDown').show().addClass('animated slideInRight');
        });
        // 点击关闭工单
        $('#close').on('click', function() {
          $('.workOrder-wrap').removeClass('animated slideInRight').addClass('animated bounceOutDown');
        });
        // 点击提交也关闭工单
        $('#workOrder-sub').on('click', function() {
          $('.workOrder-wrap').removeClass('animated slideInRight').addClass('animated bounceOutDown');
        });
      }
    }, 0);
    container.append(msgToDisplay);
  },
  // 展示图片的函数
  displayImage: function(obj, elem) {
    if (!elem) {
      var container = $('.historyMsg');
    } else {
      var container = elem;
    }
    if (obj.fromid === this.userId) {
      data = new Date().toTimeString().substr(0, 8),
        msgToDisplay = $(`<div class="newmsgWrap clearfix">
        <div class="newcusMsg">
        <a href='${obj.msg}' target='_blank'>
        <img src='${obj.msg}'/>
        </a>
          <p class="shoWDate">${data}</p>
        </div>

      </div>`);
    } else {
      var
        data = new Date().toTimeString().substr(0, 8),
        msgToDisplay = $(`<div class="newmsgWrap clearfix">
        <img class='kefu-photo' src='/img/kefu/1.png' />
        <div class="newserMsg">
        <a href='${obj.msg}' target='_blank'>
        <img src='${obj.msg}'/>
        </a>
          <p class="shoWDate">${data}</p>
        </div>

      </div>`);
    }
    container.append(msgToDisplay);
    setTimeout(function() {
      container.scrollTop(container[0].scrollHeight);
    }, 0);
    //console.log(imgData);
  },
  // 初始化表情
  initialEmoji: function() {
    var emojiContainer = document.getElementById('emojiWrapper'),
      // 先创建一个文档碎片 然后再一次性添加
      docFragment = document.createDocumentFragment();
    for (var i = 60; i > 0; i--) {
      var emojiItem = document.createElement('img');
      emojiItem.src = '/img/emoji/emo_' + i + '.gif';
      emojiItem.title = i;
      docFragment.appendChild(emojiItem);
    }
    emojiContainer.appendChild(docFragment);
  },

  // 展示表情的函数
  showEmoji: function(msg) {
    var reg = /\[emoji:(\d+)\]/g;
    if (reg.exec(msg)) {
      msg = msg.replace(reg, `<img src="/img/emoji/emo_${'$1'}.gif" />`);
    }
    return msg;
  },
  _post: function(url, obj) {
    $.ajax({
      type: 'POST',
      url: url,
      data: {
        data: obj
      },
      success: function(data) {
        console.log("发送成功");

      }
    });
  }
};
