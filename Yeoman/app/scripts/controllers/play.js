'use strict';

/**
 * @ngdoc function
 * @name funAtWebApp.controller:PlayCtrl
 * @description
 * # PlayCtrl
 * Controller of the funAtWebApp
 */
 angular.module('funAtWebApp')
   .controller('PlayCtrl', function ($timeout, $scope, socketService, dbService, $route) {
     console.log('SE EXECUTA PLAY CTRL !!!');

     if(dbService.initialized() === 0){
         location.replace("http://localhost:9000/#!/");
         return;
     }

     $scope.name = "gol";
     $scope.enemyName = 'gol';
     $scope.enemyInfo;
     $scope.roomNumber = -1;

     $scope.currentQuestion = '';
     $scope.answers = [];
     $scope.correctAnswer = -1;
     document.getElementById('option0').style.display = "none";

     $scope.enemies = [];
     $scope.enemyScore = -1;
     $scope.myScore = 0;
     socketService.setNuAbandonezEu(false);

     $scope.name = dbService.getUserInfo().user.name;
     console.log(dbService.getUserInfo().user.picture.data.url);
     document.getElementById("my-image-id").src = dbService.getUserInfo().user.picture.data.url;


     socketService.joinRoom();

     document.getElementsByClassName("play-current-enemy-div")[0].style.display = "none";
     document.getElementsByClassName("play-footer-div")[0].style.display = "none";
     document.getElementById("play-enemies-button").style.display = "none";
     document.getElementsByClassName("loader")[0].style.display = "block";

     socketService.subscribeToWaiting(function(data){
         // console.log("RoomState : " + data.correctAnswer);
         $timeout(function() {
           clearInterval($scope.countDown);
           document.getElementById("timer-div").innerHTML="";
           console.log("se executa Waiting ...");
           if(data.roomNumber === -1){
             location.replace("http://localhost:9000/#!/home");
             return;
           }
           $scope.currentQuestion = 'Waiting in room ' + data.roomNumber + ' ... ';
           $scope.roomNumber = data.roomNumber;
           socketService.setRoomName('room'+data.roomNumber);
         });
       });

      socketService.subscribeToEnemyFound(function(data){
        $timeout(function() {
          console.log("Enemy Found");
          document.getElementsByClassName("play-current-enemy-div")[0].style.display = "inline";
          document.getElementsByClassName("play-footer-div")[0].style.display = "inline-flex";
          document.getElementById("play-enemies-button").style.display = "inline-flex";
          document.getElementsByClassName("loader")[0].style.display = "none";
          $scope.enemyName = data.enemyData.name;
          $scope.roomNumber = data.roomNumber;
          $scope.enemyInfo = data.enemyData;
          document.getElementById("enemy-image-id").src = data.enemyData.picture.data.url;

          socketService.setRoomName('room'+data.roomNumber);
        });
      });

     socketService.subscribeToNewQuestionAndScore(function(data){
       $timeout(function() {
         $scope.startTime = new Date().getTime();
         $scope.countDown = setInterval(function(){
           $scope.currentTime = new Date().getTime();
            $scope.timer=parseInt(($scope.currentTime-$scope.startTime)/1000);
            document.getElementById("timer-div").innerHTML=10-$scope.timer;
        },0);

         console.log("New Question");
         $scope.currentQuestion = data.question.questionText;

         document.getElementById('option0').style.display = 'none';
         document.getElementById('option1').style.display = 'inline';
         document.getElementById('option2').style.display = 'inline';
         document.getElementById('option3').style.display = 'inline';

         $scope.answers[0] = data.question.answers[0];
         $scope.answers[1] = data.question.answers[1];
         $scope.answers[2] = data.question.answers[2];
         if(data.score[0].id == dbService.getUserInfo().user.id){
           $scope.myScore = data.score[0].score;
           $scope.enemyScore = data.score[1].score;
         }
         else{
           $scope.myScore = data.score[1].score;
           $scope.enemyScore = data.score[0].score;
         }
       });
     });

     socketService.subscribeToGameOver(function(data){
       $timeout(function(){
         console.log('Game Over');
         if(data.winnerId == '0'){
           socketService.setWinningState('tied');
           location.replace("http://localhost:9000/#!/stats");
           return;
         }
         if(dbService.getUserInfo().user.id == data.winnerId){
           socketService.setWinningState('won');
           location.replace("http://localhost:9000/#!/stats");
           return;
         }
         if(dbService.getUserInfo().user.id != data.winnerId){
           socketService.setWinningState('lost');
           location.replace("http://localhost:9000/#!/stats");
           return;
         }

       });
     });


     function sendMyAnswer(answer) {
       document.getElementById('option1').style.display = 'none';
       document.getElementById('option2').style.display = 'none';
       document.getElementById('option3').style.display = 'none';

       document.getElementById('option0').style.display = 'inline';
       document.getElementById('option0').style.margin = 'auto';
       document.getElementById('option0').innerHTML = $scope.answers[answer];
       socketService.sendThisAnswer(answer);
     }
     $scope.sendMyAnswer = sendMyAnswer;

     var flagProfile = 0;
     var flagEnemies = 0;

     function newQuestion() {
         currentQuestion = question[Math.floor(Math.random() * (question.length))];
         document.getElementsByTagName('h1')[0].innerHTML=currentQuestion[0];
         document.getElementById('option1').innerHTML=currentQuestion[1];
         document.getElementById('option2').innerHTML=currentQuestion[2];
         document.getElementById('option3').innerHTML=currentQuestion[3];
     }

     function setProfileVisible() {
       console.log("Se executa setProfileVisible !");
       if(flagProfile%2==0){
         document.getElementById('player-profile-id').style.visibility = 'visible';
         // document.getElementById('play-me-button').style.visibility = 'hidden';
       }
       else{
         document.getElementById('player-profile-id').style.visibility = 'hidden';
       }
       flagProfile++;
     }

     function setEnemiesVisible() {
       console.log("Se executa setEnemiesVisible !");
       if(flagEnemies%2==0){
         document.getElementById('player-enemy-id').style.visibility = 'visible';
         // document.getElementById('play-me-button').style.visibility = 'hidden';
       }
       else{
         document.getElementById('player-enemy-id').style.visibility = 'hidden';
       }
       flagEnemies++;
     }
     $scope.setProfileVisible = setProfileVisible;
     $scope.setEnemiesVisible = setEnemiesVisible;

     $scope.$on('$routeChangeStart', function(next, current) {
       console.log('Left Play event caught !');
       var nuAbandonezEu = socketService.getNuAbandonezEu();
       if(!nuAbandonezEu){
         socketService.abandon($scope.enemyName);
         socketService.clearAllSubscribers();
       }
       socketService.clearAllSubscribers();
    });

   });
