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
     $scope.id = -1;
     $scope.enemyId = -1;
     $scope.roomNumber = -1;

     $scope.currentQuestion = '';
     $scope.answers = [];
     $scope.correctAnswer = -1;
     $scope.enemies = [];
     $scope.enemyScore = -1;
     $scope.myScore = 0;

     $scope.id = dbService.getUserInfo().id;

     socketService.joinRoom();

     document.getElementsByClassName("play-current-enemy-div")[0].style.display = "none";
     document.getElementsByClassName("play-footer-div")[0].style.display = "none";
     document.getElementById("play-enemies-button").style.display = "none";
     document.getElementsByClassName("loader")[0].style.display = "block";

     socketService.subscribeToWaiting(function(data){
         // console.log("RoomState : " + data.correctAnswer);
         $timeout(function() {
           console.log("se executa Waiting ...");
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
          $scope.enemyId = data.enemyData.id;
          $scope.roomNumber = data.roomNumber;
          socketService.setRoomName('room'+data.roomNumber);
        });
      });

     socketService.subscribeToNewQuestionAndScore(function(data){
       $timeout(function() {
         console.log("New Question");
         $scope.currentQuestion = data.question.questionText;
         $scope.answers[0] = data.question.answers[0];
         $scope.answers[1] = data.question.answers[1];
         $scope.answers[2] = data.question.answers[2];
         if(data.score[0].id == dbService.getUserInfo().id){
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
         if(data.winnerId == 0){
           socketService.setWinningState('tied');
           location.replace("http://localhost:9000/#!/stats");
           return;
         }
         if(dbService.getUserInfo().id == data.winnerId){
           socketService.setWinningState('won');
           location.replace("http://localhost:9000/#!/stats");
           return;
         }
         if(dbService.getUserInfo().id != data.winnerId){
           socketService.setWinningState('lost');
           location.replace("http://localhost:9000/#!/stats");
           return;
         }

       });
     });


     function sendMyAnswer(answer) {
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
       var notAbandoning = socketService.getNotAbandoning();
       if(!notAbandoning){
         socketService.abandon($scope.enemyId);
         socketService.clearAllSubscribers();
       }
       socketService.clearAllSubscribers();
    });

   });
