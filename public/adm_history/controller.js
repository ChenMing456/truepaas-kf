(function(angular) {
  'use strict';
  var module = angular.module('adm.history',['ngRoute','adm.scrollToBottom']);
  module.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/adm/history', {
      templateUrl: '/tpl/history.html',
      controller: 'adm_historyCtrl'
    });
  }]);

  module.controller('adm_historyCtrl', ['$scope',
    '$route',
    '$routeParams', '$http',
    function($scope,
      $route, $routeParams, $http) {
      $scope.obj = {
        fromid: 'aaa',
        role: 'admin'
      };
      $http({
        method: 'post',
        url: '/admin/allLeaveMsg',
        data: {
          // toid: 'aaa',
          // _status: 1
        }
      }).success(function(res) {
        $scope.users = res;
        //console.log('aaaaaaaaa'+res);
      }).error(function(data, status) {
        console.log(data);
      });
      //根据传过来的msg发AJAX
      $scope.showOldMsgDetail = function(fromid) {
        $scope.everyDetail = [];
        console.log('showOldMsgDetail_fromid:' + fromid);
        $http({
          method: 'post',
          url: '/admin/leaveMsg',
          data: {
            fromid: fromid,
            toid: 'aaa',
          }
        }).success(function(res) {
          res.forEach(function(item) {
            if (item.msg.indexOf('\/upload\/') > -1) {
              $scope.everyDetail.push({
                name: item.fromid,
                img: item.msg,
                time: item.meta
              });
            } else {
              $scope.everyDetail.push({
                name: item.fromid,
                msg: item.msg,
                time: item.meta
              });
            }
          });
          console.log('消息条数' + res.length);
        }).error(function(data, status) {
          console.log(data);
        });
      };


    }
  ]);
})(angular);
