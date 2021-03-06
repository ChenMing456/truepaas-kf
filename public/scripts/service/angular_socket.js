var angular_socket=angular
  .module('angular_socket', [
  ]);
angular_socket.factory('socket', ['$rootScope', function($rootScope) {
  var socket = io.connect(); //默认连接部署网站的服务器
  return {
    on: function(eventName, callback) {
      socket.on(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function() { //手动执行脏检查
          callback.apply(socket, args);
        });
      });
    },
    emit: function(eventName, data, callback) {
      socket.emit(eventName, data, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
}]);
