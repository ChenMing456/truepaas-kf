(function(angular) {
  'use strict';
  var module = angular.module('adm.login', ['ngRoute']);
  module
    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/adm/login', {
        controller: 'adm_loginCtrl'
      });
    }])
    .controller('adm_loginCtrl', ['$scope',
      '$route',
      '$routeParams', '$http', '$timeout', '$location',
      function($scope,
        $route, $routeParams, $http,$timeout, $location) {
        $scope.goPath=function(){
        $location.path('/adm/chatting');
        }
        // 后台验证成功之后把
        $scope.rightToLogin = function() {
          var username = $scope.username;
          var password = $scope.password;
          $http({
            method: 'post',
            url: '/admin/new/login',
            data: {
              username: username,
              password: password
            }
          }).success(function(res) {
            if (res) {
              $scope.haslogined = true;
              $scope.$emit('showMainPage', $scope.haslogined);
            $scope.goPath();
              
            } else {
              $('.showAlert').removeClass('animated bounceOutUp').show().addClass('animated bounceIn');
             $timeout(function(){
               $('.showAlert').removeClass('animated bounceIn').addClass('animated bounceOutUp');
             },2000)
            }
          }).error(function(data, status) {
            console.log(data);
          });
        };
        $scope.$on('showLoginPage', function(event, data) {
          $scope.haslogined = data;
        });
      }
    ]);
})(angular);
