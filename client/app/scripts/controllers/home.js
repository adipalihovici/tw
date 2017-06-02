'use strict';

/**
 * @ngdoc function
 * @name funAtWebApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the funAtWebApp
 */
angular.module('funAtWebApp')
  .controller('HomeCtrl', function ($scope, dbService) {
    document.getElementById("menu-header").style.display = "block";
    $scope.fullName = ''; $scope.formula = '';
    var facutGet = false;

console.log('ref = ' + document.referrer);
    if((dbService.initialized()==0) && (document.referrer === 'http://localhost:9000/')){
        var facutGet = true;
        dbService.fetchUserInfo().then( function successCallback(response){
        console.log('Facut GET la latestLogin in main.js => id = ' + response.data.user.id + " and name = " + response.data.user.name);
        dbService.setUserInfo(response.data);
        $scope.fullName = response.data.user.name;
        if(response.data.user.gender === 'male'){
          $scope.formula = 'Mr.';
        }
        if(response.data.user.gender === 'female'){
          $scope.formula = 'Miss';
        }
      });
    }
    else{
      if((dbService.initialized() === 0) && (!facutGet)){
        location.replace('http://localhost:9000/#!/');
        return;
      }
      $scope.fullName = dbService.getUserInfo().user.name;
      if(dbService.getUserInfo().user.gender === 'male'){
        $scope.formula = 'Mr.';
      }
      if(dbService.getUserInfo().user.gender === 'female'){
        $scope.formula = 'Miss';
      }
    }
  });
