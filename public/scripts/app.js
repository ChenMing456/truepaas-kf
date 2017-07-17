'use strict';
angular
  .module('app', [
    'ngRoute',
    'adm.chatting',
    'adm.oldmsg',
    'adm.history',
    'adm.login',
    'adm.workorder'
  ])
  .config(['$routeProvider', function($routeProvider, $location) {
    $routeProvider
      .otherwise({
        redirectTo: '/adm/login',
      });
  }])
  .controller('appCtrl', ['$scope', '$location', '$http', 'socket', function($scope, $location, $http, socket) {
    // socket.emit('connect','aaa')
    $scope.haslogined = false;
    $scope.$on('showMainPage', function(event, data) {
      $scope.haslogined = data;
    });
    $scope.pageGoLogin = function() {
      $http({
        method: 'post',
        url: '/admin/updateChatting',
        data: {
          flag: 2
        }
      }).success(function(res) {
        console.log('updateChatting' + res);
      }).error(function(data, status) {
        console.log(data);
      });
      $location.path('/adm/login');
      $scope.haslogined = false;
      $scope.$broadcast('showLoginPage', $scope.haslogined);
    };
  }]);
