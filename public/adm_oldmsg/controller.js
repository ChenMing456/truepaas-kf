(function(angular) {
  'use strict';
  var module = angular.module('adm.oldmsg', ['ngRoute', 'angular_socket']);
  module.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/adm/oldmsg', {
      templateUrl: '/tpl/oldMsg.html',
      controller: 'adm_oldmsgCtrl'
    });
  }]);

  module.controller('adm_oldmsgCtrl', ['$scope',
    '$route',
    '$routeParams', '$http', '$location',
    function($scope,
      $route, $routeParams, $http, $location) {
      $scope.chat = [];
      $http({
        method: 'post',
        url: '/admin/allLeaveMsg',
        data: {
          _status:0
        }
      }).success(function(res) {
        $scope.users = res;
        console.log('aaaaaaaaa' + JSON.stringify(res));
      }).error(function(data, status) {
        console.log(data);
      });

     
      $scope.showOldMsgDetail = function(fromid) {
        //根据传过来的msg发AJAX
        $http({
          method: 'post',
          url: '/admin/leaveMsg',
          data: {
            fromid: fromid,
            _status: 0
          }
        }).success(function(res) {
          $scope.everyDetail = res;
          console.log('everyDetail' + fromid+'  '+res);
        }).error(function(data, status) {
          console.log(data);
        });
      };
      // 判断消息是否解决
      $scope.startNewMsg = function(toid) {
        $location.path('/adm/chatting');
        console.log('发起会话:' + toid);
        $http({
          method: 'post',
          url: '/admin/updateChatting',
          data: {
            chatting: toid,
            flag: 0
          }
        }).success(function(res) {
          console.log('chatting清空');
        }).error(function(data, status) {
          console.log(data);
        });
        $http({
          method: 'post',
          url: '/admin/msgUp',
          data: {
            fromid: toid,
            _status: 1
          }
        }).success(function(res) {

          console.log('update留言状态:' + res);
        }).error(function(data, status) {
          console.log(data);
        });
        
        // for (var i = 0; i < $scope.users.length; i++) {
        //   if ($scope.users[i] == msg) {
        //     $scope.users.splice(i, 1);
        //     console.log($scope.users);
        //     // 发AJAX告诉服务器 已解决的消息 同时在当前回话显示出来
        //   }
        // }
        // $location.path('/adm/chatting');
      };
    }
  ]);
})(angular);
