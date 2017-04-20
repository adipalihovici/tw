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
    ["What does HTML"+'\n'+ "stand for?","The best","Hai taci mai, lasa-ma!","HyperText Markup Language",3],
    ["Is the Earth flat?","Yes","No","Maybe",2],
    ["Who formulated the Theory of Relativity","Isaac Newton","Albert Einstein","Stephen Hawking",2]
    ];

    function main() {
      console.log(1968);
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
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    $scope.healthbar = "ahviuhsfduihiu";
    
  });
