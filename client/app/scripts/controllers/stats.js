'use strict';

/**
 * @ngdoc function
 * @name funAtWebApp.controller:StatsCtrl
 * @description
 * # StatsCtrl
 * Controller of the funAtWebApp
 */
angular.module('funAtWebApp')
  .controller('StatsCtrl', function ($scope, dbService, socketService) {
    $scope.deznodamant = '';
    console.log('socketService.getWinningState = ' + socketService.getWinningState());
    if(socketService.getWinningState() == 'won'){
      $scope.deznodamant = 'Congratulations !';
      return;
    }
    if(socketService.getWinningState() == 'lost'){
      $scope.deznodamant = 'That\'s too bad ! Better luck next time !';
      return;
    }
    if(socketService.getWinningState() == 'tied'){
      $scope.deznodamant = 'You tied your enemy ! Congratulations !';
      return;
    }
    if(socketService.getWinningState() == 'abandoned'){
      $scope.deznodamant = 'Shame on you, you abandoner !';
      return;
    }
  });
