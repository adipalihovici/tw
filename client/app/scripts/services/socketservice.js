'use strict';

/**
 * @ngdoc service
 * @name funAtWebApp.socketService
 * @description
 * # socketService
 * Service in the funAtWebApp.
 socketservice.joinRoom(); */
angular.module('funAtWebApp')
  .service('socketService', function (dbService) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    //console.log("Socket URL = " + SOCKET_URL);
    var socket = io('http://localhost:3050');

    var subscribersToWaiting = [];
    var subscribersToEnemyFound = [];
    var subscribersToNewQuestionAndScore = [];
    var subscribersToEnemyLeft = [];
    var subscribersToGameOver = [];
    var roomName = 'gol';
    var alreadyAnswered = false;
    var winningState = '';
    var nuAbandonezEu = false;



    socket.on('waiting', function (data) {
      for(var i = 0; i < subscribersToWaiting.length; i++){
        subscribersToWaiting[i](data);
      }
    });

    socket.on('enemy found', function(data){
      for(var i = 0; i < subscribersToEnemyFound.length; i++){
        subscribersToEnemyFound[i](data);
      }
    })

    socket.on('new question and score', function(data){
      alreadyAnswered = false;
      for(var i = 0; i < subscribersToNewQuestionAndScore.length; i++){
        subscribersToNewQuestionAndScore[i](data);
      }
    });

    socket.on('game over', function(data){
      nuAbandonezEu = true;
      for(var i = 0; i < subscribersToGameOver.length; i++){
        console.log('data.winnerId='+data.winnerId);
        subscribersToGameOver[i](data);
        roomName = 'gol';
      }
    });

    return{

      joinRoom: function(){
        console.log(dbService.getUserInfo().user.id +  ' trimite join room');
        socket.emit('join room', dbService.getUserInfo().user);
      },

      sendThisAnswer: function(answer){
        if(!alreadyAnswered){
          console.log(dbService.getUserInfo().user.id + ' trimite raspunsul ' + answer + ' din camera ' + roomName);
          alreadyAnswered = true;
          socket.emit('answer', {playerData: dbService.getUserInfo().user, clientRoomName: roomName, answer: answer});
        }
        else{
          console.log('Nu incerca sa trisezi ! Un raspuns a fost deja trimis ! ');
        }
      },

      abandon: function(enemyName){
        var myInfo = dbService.getUserInfo();
        console.log(myInfo.user.id + ' paraseste abandoneaza !');
        var grav = true;
        if(enemyName === 'gol'){
          grav = false;
        }
        socket.emit('abandon', {playerData: myInfo.user, clientRoomName: roomName, grav: grav});
        if(grav){
          winningState = 'abandoned';
        }
        roomName = 'gol';
      },

      subscribeToWaiting: function(callback){
          console.log('Subscribed to waiting');
          subscribersToWaiting.push(callback);
      },

      subscribeToEnemyFound: function(callback){
        console.log('Subscribed to enemy found');
        subscribersToEnemyFound.push(callback);
      },

      subscribeToNewQuestionAndScore: function(callback){
        console.log('Subscribed to new question and score');
        subscribersToNewQuestionAndScore.push(callback);
      },

      subscribeToGameOver: function(callback){
        console.log('Subscribed to game over');
        subscribersToGameOver.push(callback);
      },

      setRoomName: function(roomNameParam){
        console.log('Room name set to ' + roomNameParam);
        roomName = '' + roomNameParam;
      },
      setWinningState: function(winning){
        console.log('WinningState is set to ' + winning);
        winningState = winning;
      },
      getWinningState: function(winning){
        console.log('getting winningState');
        return winningState;
      },
      setNuAbandonezEu: function(val){
        console.log('setting nuAbandonezEu ' + val);
        nuAbandonezEu = val;
      },
      getNuAbandonezEu: function(){
        return nuAbandonezEu;
      },
      clearAllSubscribers: function(){
        subscribersToGameOver.length = 0;
        subscribersToNewQuestionAndScore.length = 0;
        subscribersToEnemyFound.length = 0;
        subscribersToWaiting.length = 0;
        subscribersToEnemyLeft.length = 0;
      }
    };
  });
