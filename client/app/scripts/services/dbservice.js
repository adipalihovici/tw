'use strict';

/**
 * @ngdoc service
 * @name funAtWebApp.dbservice
 * @description
 * # dbservice
 * Service in the funAtWebApp.
 */
angular.module('funAtWebApp')
  .service('dbService', function ($http) {
    // AngularJS will instantiate a singleton by calling "new" on this function

     var myInfo = {id: -1, level: -1};

    return {

      fetchUserInfo: function () {

          if(myInfo.id > -1){
            return myInfo;
          }
          else{
              return $http({method: 'GET', url: 'http://localhost:3000/latestLogin'});
          }

      },

      getUserInfo: function () {

            return myInfo;

      },

      initialized: function(){
        if(myInfo.id>-1){
          return 1;
        }
        else{return 0;}
      },

      setUserInfo: function (newUserInfo) {


          myInfo.id = newUserInfo.id; myInfo.level = newUserInfo.level;
          console.log('myInfo has been set to id = ' + myInfo.id + ' , level = '  + myInfo.level);

      }

    };
  });
