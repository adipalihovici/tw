'use strict';

/**
 * @ngdoc overview
 * @name funAtWebApp
 * @description
 * # funAtWebApp
 *
 * Main module of the application.
 */
angular
  .module('funAtWebApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
        // controllerAs: 'lgnctrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        // controllerAs: 'about'
      })
      .when('/leaderboard', {
        templateUrl: 'views/leaderboard.html',
        controller: 'LeaderboardCtrl',
        // controllerAs: 'leaderboard'
      })
      .when('/stats', {
        templateUrl: 'views/stats.html',
        controller: 'StatsCtrl',
        // controllerAs: 'stats'
      })
      .when('/play', {
        templateUrl: 'views/play.html',
        controller: 'PlayCtrl',
        // controllerAs: 'play'
      })
      .when('/home', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl',
        // controllerAs: 'home'
      })
      .otherwise({
        redirectTo: '/home.html'
      });
  });
