'use strict';
(function(angular) {
  angular.module('adm.scrollToBottom', [])
    .directive('scrollToBottom', ['$parse', '$window', '$timeout', function($parse, $window, $timeout) {

      function createActivationState($parse, attr, scope) {
        function unboundState(initValue) {
          var activated = initValue;
          return {
            getValue: function() {
              return activated;
            },
            setValue: function(value) {
              activated = value;
            }
          };
        }

        function oneWayBindingState(getter, scope) {
          return {
            getValue: function() {
              return getter(scope);
            },
            setValue: function() {}
          };
        }

        function twoWayBindingState(getter, setter, scope) {
          return {
            getValue: function() {
              return getter(scope);
            },
            setValue: function(value) {
              if (value !== getter(scope)) {
                scope.$apply(function() {
                  setter(scope, value);
                });
              }
            }
          };
        }

        if (attr !== '') {
          var getter = $parse(attr);
          if (getter.assign !== undefined) {
            return twoWayBindingState(getter, getter.assign, scope);
          } else {
            return oneWayBindingState(getter, scope);
          }
        } else {
          return unboundState(true);
        }
      }

      return {
        priority: 1,
        restrict: 'A',
        link: function(scope, $el, attrs) {
          var el = $el[0],
            activationState = createActivationState($parse, attrs.scrollToBottom, scope);

          var bottom = {
            isAttached: function(el, isAttached) {
              return isAttached;
            },
            scroll: function(el) {
              el.scrollTop = el.scrollHeight;
            }
          };

          function scrollIfGlued() {
            if (activationState.getValue() && !bottom.isAttached(el, scope.isAttached)) {
              bottom.scroll(el);
            }
          }

          scope.$watch(scrollIfGlued);

          $timeout(scrollIfGlued, 0, false);

          $window.addEventListener('resize', scrollIfGlued, false);

          $el.bind('scroll', function() {
            activationState.setValue(bottom.isAttached(el, scope.isAttached));
          });
        }
      };
    }]);
})(angular);
