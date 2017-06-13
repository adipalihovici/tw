'use strict';

/**
 * @ngdoc function
 * @name funAtWebApp.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Controller of the funAtWebApp
 */
angular.module('funAtWebApp')
  .controller('HeaderCtrl', function ($scope, $location) {
      $scope.getLocation = function (){
        return $location.path();
      }
  });
