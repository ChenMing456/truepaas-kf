(function(angular) {
  'use strict';
  var module = angular.module('adm.workorder', ['ngRoute']);
  module.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/adm/workorder', {
      templateUrl: '/tpl/workorder.html',
      controller: 'adm_workorderCtrl'
    });
  }]);

  module.controller('adm_workorderCtrl', ['$scope',
    '$route',
    '$routeParams', '$http', '$location',
    function($scope,
      $route, $routeParams, $http, $location) {
      $scope.users = [];
      // 获取工单列表（模拟数据）
      $.getJSON('/api/workorderAllUsers.json', function(data) {
        $scope.users = data.data;
        // 动态监视异步数据
        $scope.$apply('users');
      });

      // 在这里传参拿到工单详情
      // $scope.workOrderDetail = function(_id) {
      //   $http({
      //     method: 'get',
      //     url: '/work_order/' + _id,
      //   }).success(function(data) {
      //     $scope.detailOrder = data;
      //     console.log(data);
      //   }).error(function(error) {
      //     console.log(error);
      //   });
      // };
      $.getJSON('/api/workorderEachuser.json', function(data) {
        $scope.detailOrder = data.data;
        // 动态监视异步数据
        $scope.$apply('detailOrder');
        console.log($scope.detailOrder.work_order_type_id);
      });
      $scope.all = true;





    }
  ]);
})(angular);
