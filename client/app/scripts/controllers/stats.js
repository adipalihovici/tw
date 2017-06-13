'use strict';

/**
 * @ngdoc function
 * @name funAtWebApp.controller:StatsCtrl
 * @description
 * # StatsCtrl
 * Controller of the funAtWebApp
 */
angular.module('funAtWebApp')
  .controller('StatsCtrl', function ($scope, dbService, socketService, $http) {

    if(dbService.initialized() === 0){
        location.replace("http://localhost:9000/#!/login");
        return;
    }

    $scope.deznodamant = '';
    document.getElementById("my-stats-image-id").src = dbService.getUserInfo().user.picture.data.url;
    $scope.name = dbService.getUserInfo().user.name;
    console.log('socketService.getWinningState = ' + socketService.getWinningState());
    if(socketService.getWinningState() == 'won'){
      $scope.deznodamant = '~Congratulations !~';
      return;
    }
    if(socketService.getWinningState() == 'lost'){
      $scope.deznodamant = '~That\'s too bad ! Better luck next time !~';
      return;
    }
    if(socketService.getWinningState() == 'tied'){
      $scope.deznodamant = '~You tied your enemy ! Congratulations !~';
      return;
    }
    if(socketService.getWinningState() == 'abandoned'){
      $scope.deznodamant = '~Shame on you, you abandoner !~';
      return;
    }

    function postToFacebook() {
      var urlString = 'https://graph.facebook.com/'+dbService.getUserInfo().user.id+'/feed?message=Salut!+Eu+ma+joc+Fun@Web.+Joaca-te+si+tu!&link=http://127.0.0.1:9000&access_token='+dbService.getUserInfo().accessToken;
      $http({
        method: 'POST',
        url: urlString
      }).then(function successCallback(response) {
          console.log('Posted Successfully, response from FB =' + response.data);
          $scope.deznodamant = '~Thank you, so much!~';
        }, function errorCallback(response) {
          console.log('Post Error, response from FB =' + response.data.error.message);
          $scope.deznodamant = '~That did not work...~';
        });
    }
    $scope.postToFacebook = postToFacebook;

  });
