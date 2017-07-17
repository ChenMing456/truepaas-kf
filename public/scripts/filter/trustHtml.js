(function(angular) {
  'use strict';
  var transHtml = angular.module('angular.transHtml', []);
  transHtml.filter('trustHtml', ['$sce', function($sce) {
    return function(input) {
      return $sce.trustAsHtml(input);
    };
  }]);
})(angular);
