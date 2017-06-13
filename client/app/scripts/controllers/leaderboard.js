'use strict';

/**
 * @ngdoc function
 * @name funAtWebApp.controller:LeaderboardCtrl
 * @description
 * # LeaderboardCtrl
 * Controller of the funAtWebApp
 */
angular.module('funAtWebApp')
  .controller('LeaderboardCtrl', function ($scope, dbService) {

    if(dbService.initialized() === 0){
        location.replace("http://localhost:9000/#!/");
        return;
    }

    $scope.name = dbService.getUserInfo().user.name;

  });
