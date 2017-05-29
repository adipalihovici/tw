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

     var myInfo = null;

    return {

      fetchUserInfo: function () {

          if(myInfo != null){
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
        if(myInfo != null){
          return 1;
        }
        else{return 0;}
      },

      setUserInfo: function (newUserInfo) {


          myInfo = newUserInfo;
          console.log('myInfo has been set to id = ' + myInfo.user.id + ' , name = '  + myInfo.user.name);

      }

    };
  });
