'use strict';

/**
 * @ngdoc function
 * @name funwebregandit1App.controller:PlayCtrl
 * @description
 * # PlayCtrl
 * Controller of the funwebregandit1App
 */
angular.module('funwebregandit1App')
  .controller('PlayCtrl', function ($scope) {
    var currentQuestion;
    var question = [
    ["What does HTML"+'\n'+ "stand for?","The best Un raspuns foarte lung de test. aka sa vad ce se intampa cand unul dintre raspunsuri este foarte lung muuuuuult mai lung decat celelalte","Hai taci mai, lasa-ma!","HyperText Markup Language",3],
    ["Is the Earth flat?","Yes","No","Maybe",2],
    ["O intrebare mai lunga, lunga lunga, cat de lunga, destul de lunga incat vreau sa vad daca incape in divul ala de sus? Daca incape bine daca nu incape iarasi bine! Bla Bla lba bla bla bla CE ?","Isaac Newton","Albert Einstein","The best Un raspuns foarte lung de test. aka sa vad ce se intampa cand unul dintre raspunsuri este foarte lung muuuuuult mai lung decat celelalte. Poate va intrebati cat de lung este acest raspuns...... unii spun ca ar fi cel mai lung raspuns raspuns vreodata la o intrebare cu raspuns",2]
    ];
    var flagProfile = 0;
    var flagEnemies = 0;
    function main() {
      console.log("Se executa functia main() din play.js");
      health=100;
      document.getElementById('health').innerHTML="Health:"+health+"%";
      newQuestion();
    }
    main();

    function newQuestion() {
        currentQuestion = question[Math.floor(Math.random() * (question.length))];
        document.getElementsByTagName('h1')[0].innerHTML=currentQuestion[0];
        document.getElementById('option1').innerHTML=currentQuestion[1];
        document.getElementById('option2').innerHTML=currentQuestion[2];
        document.getElementById('option3').innerHTML=currentQuestion[3];
    }

    function option(x) {
      if(currentQuestion[4]!=x){
          health-=10;
          document.getElementById('health').innerHTML="Health:"+health+"%";
      }
      // if (health<=0){
      //     document.location.replace('city.html');
      // }
      newQuestion();
    }
    $scope.option = option;

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
        document.getElementById('player-enemies-id').style.visibility = 'visible';
        // document.getElementById('play-me-button').style.visibility = 'hidden';
      }
      else{
        document.getElementById('player-enemies-id').style.visibility = 'hidden';
      }
      flagEnemies++;
    }
    $scope.setProfileVisible = setProfileVisible;
    $scope.setEnemiesVisible = setEnemiesVisible;
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

  });
