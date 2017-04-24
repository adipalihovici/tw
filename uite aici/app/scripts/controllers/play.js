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
                ["What does HTML stand for?","Home Tool Markup Language","Hyperlinks and Text Markup Language","HyperText Markup Language",3],
                ["Who is making the Web standards?","Google","The W3 Consortium","Mozilla",2],
                ["Choose the correct HTML element for the largest heading:","&lt;heading&gt;","&lt;h6&gt;","&lt;h1&gt;",3],
                ["What is the correct HTML element for inserting a line break?","&lt;br&gt;","&lt;lb&gt;","&lt;break&gt;",1],
                ["What is the correct HTML for adding a background color?","&lt;background&gt;red&lt;/background&gt;","&lt;body style=\"background-color:red;\"&gt;","&lt;body bg=\"red\"&gt;",2],
                ["What is the correct HTML for creating a hyperlink?","&lt;a&gt;http://www.uaic.ro&lt;/a&gt;","&lt;a url=\"http://www.uaic.ro\"&gt;UAIC&lt;/a&gt;","&lt;a href=\"http://www.uaic.ro\"&gt;UAIC&lt;/a&gt;",3],
                ["Which character is used to indicate an end tag?","/","*","&lt;",1],
                ["Which of these elements are all &lt;table&gt; elements?","&lt;table&gt;\n&lt;tr&gt;\n&lt;tt&gt;","&lt;table&gt;\n&lt;tr&gt;\n&lt;td&gt;","&lt;thead&gt;\n&lt;body&gt;\n&lt;tr&gt;",2],
                ["What does CSS stand for?","Creative Style Sheets","Computer Style Sheets","Cascading Style Sheets",3],
                ["What is the correct HTML for referring to an external style sheet","&lt;style src=\"mystyle.css\"&gt;","&lt;stylesheet&gt;mystyle.css&lt;/stylesheet&gt;","&lt;link rel=\"stylesheet\" type=\"text/css\" href=\"mystyle.css\"&gt;\"",3],
                ["Where in an HTML document is the correct place to refer to an external style sheet?","At the end of the document","In the &lt;head&gt; section","In the &lt;body&gt; section", 2],
                ["Which HTML tag is used to define an internal style sheet?","&lt;style&gt;","&lt;css&gt;","&lt;script&gt;",1],
                ["Which is the correct CSS syntax?","body {color: black;}","{body:color=black;}","{body;color:black;}",1],
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
