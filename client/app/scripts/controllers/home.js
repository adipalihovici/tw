'use strict';

/**
 * @ngdoc function
 * @name funAtWebApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the funAtWebApp
 */
angular.module('funAtWebApp')
  .controller('HomeCtrl', function (dbService) {
    document.getElementById("menu-header").style.display = "block";

    if(dbService.initialized()==0){
        dbService.fetchUserInfo().then( function successCallback(response){
        console.log('Facut GET la latestLogin in main.js => id = ' + response.data[0].id + " and level = " + response.data[0].level);
        dbService.setUserInfo(response.data[0]);
      });
    }

  });
