(function(angular) {
  'use strict';
  var module = angular.module('adm.chatting', [
    'ngRoute',
    'angular_socket',
    'angular.transHtml',
    'adm.scrollToBottom'
  ]);
  module.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/adm/chatting', {
      templateUrl: '/tpl/newMsg.html',
      controller: 'adm_chatCtrl'
    });
  }]);

  module.controller('adm_chatCtrl', ['$scope',
    '$route',
    '$routeParams', '$http', 'socket', '$timeout', '$document',
    function($scope,
      $route, $routeParams, $http, socket, $timeout, $document) {
      $scope.obj = {
        fromid: 'aaa',
        role: 'admin',
        roomid: null,
        toid: null,
        msg: null,
        flag: false
      };
      //flag 用来标志 用户和客服是否都在聊天室中
      socket.emit('connect', $scope.obj);
      $http({
        method: 'get',
        url: '/admin/' + 'aaa'
      }).success(function(res) {
        $scope.chatting = res.chatting;
      }).error(function(data, status) {
        console.log(data);
      });
      $scope.msg = '';
      $scope.time = new Date().toTimeString().substr(0, 8);
      // 判断表情显示还是隐藏
      $scope.emojiShow = false;
      // 创建一个数组保存表情
      $scope.allEmoji = [];
      for (var i = 60; i > 0; i--) {
        $scope.allEmoji.push({
          id: i,
          src: `/tmp/img/emoji/emo_${i}.gif`
        });
      };
      socket.on('newRoom', function(obj) {
        console.log('obj.flag：' + obj.flag);
        if (obj.flag) {
          console.log('客服加入聊天室' + JSON.stringify(obj));
          $scope.obj.roomid = obj.roomid;
          $scope.obj.flag = true;
        } else {
          console.log('客服加入聊天室失败，对方不在线');
        }
      });
      socket.on('leaveRoom', function(obj) {
        console.log('leaveRoom：' + obj);
        $scope.obj.flag = false;

      });
      socket.on('newMsg', function(obj) {
        console.log('客服收到了private_msg' + JSON.stringify(obj));
        var chatUser = document.getElementById("userName").innerText;
        console.log('chatUser:'+chatUser);
        if(obj.fromid == chatUser){
          if (obj.msg.indexOf('\/upload\/') > -1) {
            $scope.displayImage(obj);
          } else {
            $scope.users.push({
              'name': obj.fromid,
              'msg': obj.msg,
              'date': obj.meta
            });
            console.log('$scope.obj.fromid:'+$scope.obj.fromid);
          }
        }
      });
      //点击用户名发起会话并且把留言显示在右边
      $scope.showUserMsg = function(fromid) {
        $scope.users = [];
        console.log('showUserMsg：' + fromid);
        $scope.obj.toid = fromid;
        socket.emit('connect', $scope.obj);
        socket.emit('join', $scope.obj);
        //创建了单独的聊天室
         // method: 'post',
         //  url: '/admin/leaveMsg',
         //  data: {
         //    fromid: fromid,
         //    toid: 'aaa',
         //    _status: 1
         //  }
        //把留言为1的留言拿到
        $http({
          method: 'post',
          url: '/admin/userMsg',
          data: {
            fromid: fromid,
            toid: 'aaa',
          }
        }).success(function(res) {
          res.forEach(function(item) {
            if (item.msg.indexOf('\/upload\/') > -1) {
              $scope.displayImage(item);
            } else {
              $scope.users.push({
                'name': item.fromid,
                'msg': item.msg,
                'time': item.meta
              });
            }
          });
          // $scope.users=res;
        }).error(function(data, status) {
          console.log(data);
        });
        $scope.users.concat($scope.fromid);
      };
      //发送工单
      $scope.sendWorkorder = function() {
        $scope.obj.msg = '<i class="iconfont icon-tianxie"></i>填写工单';
        console.log('发送消息成功!');
        
        $scope.obj.msgStatus = 1;
        
        socket.emit('private_msg', $scope.obj);

        $http({
          method: 'post',
          url: '/addMessage',
          data: {
            data: $scope.obj
          }
        }).success(function(res) {
          // $scope.users=res;
          console.log('消息存入数据库中:' + res);
        }).error(function(data, status) {
          console.log(data);
        });
        $scope.users.push({
          'name': $scope.obj.fromid,
          'msg': $scope.obj.msg,
          'date': $scope.obj.meta
        });
        $scope.msg = '';
      };
      //点击结束对话 从chating中移除 并将对话状态改为2
      $scope.stopMsg = function(fromid) {
        console.log('stopMsg：' + fromid);
      };
      $scope.emojiClick_show = function($event) {
        $event.stopPropagation();
        $scope.emojiShow = true;
      };
      $document.bind('click', function() {
        $scope.emojiShow = false;
        $scope.$apply();
      });
      // 点击每一个表情 在输入框显示相应的字符
      $scope.everyEmojiClick = function($event) {
        var target = $event.target;
        $('#textarea_text').focus();
        $timeout($scope.msg += `[emoji:${target.title}]`);
      };
      // 展示表情的函数
      $scope.displayEmoji = function(msg) {
        var reg = /\[emoji:(\d+)\]/g;
        if (reg.exec(msg)) {
          msg = msg.replace(reg, `<img src="/tmp/img/emoji/emo_${'$1'}.gif" />`);
        }
        return msg;
      };
      //发送文字消息
       $('#textarea_text').on('keyup', function(event) {
      // $scope.submit = function(msg) {
        var nowElem = $('#textarea_text'),
        msg = nowElem.val();
      // if (_val.length >= 200) {
      //   nowElem.val(_val.substring(0, 200));
      // }
      // $('.expandingArea span').html($(this).val());
      // 输入消息点击回车发送消息
      if (event.keyCode == 13) {
         //if (msg.trim()) {
            var msg = $scope.displayEmoji(msg);
            $scope.obj.msg = msg;
            console.log('发送消息成功!'+JSON.stringify($scope.obj));
            
            $scope.obj.msgStatus = 1;
            
            socket.emit('private_msg', $scope.obj);
            $http({
              method: 'post',
              url: '/addMessage',
              data: {
                data: $scope.obj
              }
            }).success(function(res) {
              // $scope.users=res;
              console.log('消息存入数据库中:' + res);
            }).error(function(data, status) {
              console.log(data);
            });
            $scope.users.push({
              'name': $scope.obj.fromid,
              'msg': $scope.obj.msg,
              'time': $scope.obj.meta
            });
            $scope.msg = '';
          // } else {
          //   return false;
          // }
        }
      });
      // 监视发送图片消息
      $('#send_photo').bind('change', function() {
        var obj = {
          fromid: $scope.obj.userId,
          toid: $scope.obj.toid,
          msg: null,
          role: 'user',
          roomid: $scope.obj.roomid,
          msgStatus: 0
        };
        var ff = document.getElementById('editfile');
        var formdata = new FormData(ff);
        $.ajax({
          url: '/upload',
          type: 'POST',
          data: formdata,
          cache: false,
          contentType: false,
          processData: false,
          success: function(data) {
            //blob 转 base64 直接显示
            console.log('data：' + data);
            $scope.obj.msg = data;
            $scope.displayImage($scope.obj);
            console.log('data：' + JSON.stringify($scope.obj));
            $.ajax({
              url: '/addMessage',
              type: 'POST',
              data: {
                data: $scope.obj
              },
              success: function(data) {
                console.log('data:' + data);
                if ($scope.obj.roomid && $scope.obj.flag) {
                  $scope.obj.msgStatus = 1;
                } else {
                  $scope.obj.msgStatus = 0;
                }
                socket.emit('private_msg', $scope.obj);
                console.log('发送成功!');
              },
              error: function() {}
            });
          },
          error: function() {}
        });
      });
      // 展示图片的函数
      $scope.displayImage = function(obj) {
        // 等页面渲染完成就push
        $timeout(
          $scope.users.push({
            'name': obj.fromid,
            'img': obj.msg,
            'time': obj.meta
          }));
        $scope.msg = '';
      };
      //点击用户列表,
      // 点击会话列表就显示或者隐藏
      $scope.showOnline = false;
      $scope.showOnlineClick = function() {
        $scope.showOnline = !$scope.showOnline;
      };
      // 点击离线列表就显示或者隐藏
      $scope.showUnline = false;
      $scope.showUnlineClick = function() {
        $scope.showUnline = !$scope.showUnline;
      };
    }
  ]);
})(angular);
