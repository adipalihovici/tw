'use strict';

/**
 * @ngdoc function
 * @name funAtWebApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the funAtWebApp
 */
angular.module('funAtWebApp')
  .controller('AboutCtrl', function (dbService) {
    if(dbService.initialized() === 0){
        location.replace("http://localhost:9000/#!/");
        return;
    }
  });
