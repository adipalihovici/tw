var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var socketIo = require('socket.io');
var auxiliary = require('funweb-functions');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "http://localhost:9000");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}



var latestLoggedUser;
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;
var localProfile;
  passport.use('facebook', new FacebookStrategy( {
    clientID: '1932507860364422',
    clientSecret: '13ccadb9b8dd711faddbec2b34ca14d7',
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'name', 'gender', 'photos'],
    scope: ["publish_actions"]
  }, function(accessToken, refreshToken, profile, done) {
        latestLoggedUser = {user: profile._json, accessToken: accessToken, refreshToken: refreshToken};

        ///////////////////////   UPSERT PENTRU PROFIL /////////////////////////////////////////////////////////////////////////////
        upsertLoggedPlayer(profile._json, accessToken, refreshToken);
        console.log(profile._json);
        done(null, profile);
}));
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});




var app = express();
app.use(allowCrossDomain);
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(passport.initialize());
app.use(passport.session());


var connections = [];
var rooms = [];
var roomTimers = [];
var nowPlaying = [];

app.listen(3000, function(){
  console.log('Server started at 3000...');
})


var io = new socketIo(3050);

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
passport.authenticate('facebook', { failureRedirect: 'http://localhost:9000/#!/login'}),
function(req, res) {
// absolute path
    res.redirect('http://localhost:9000/#!/home');
});


app.get('/', function(req, res){
  res.send('In route. serverul te saluta');
})

app.get('/latestLogin', function (req, res) {
  return res.json(latestLoggedUser);
});

app.use(allowCrossDomain);
var refreshRoom;

io.sockets.on('connection', function(socket){
  connections.push({
    socket: socket,
    info: {}
  });

  console.log('Connected: %s sockets connected', connections.length);

  socket.on('disconnect', function(data){
      connections.splice(connections.indexOf(socket), 1);
      var found = false;
      var room = null;
      var player = null;
      for(var i = 0; i < rooms.length; i++){
        for(var j = 0; j < rooms[i].players.length; j++){
          if((rooms[i].players[j].socket != null) && (rooms[i].players[j].socket.id == socket.id)){
            room = rooms[i];
            player = rooms[i].players[j];
            found = true;
            break;
          }
        }
        if(found){break;}
      }

      if((room == null) || (player == null)){
        return ;
      }

      removeTimer(room.name); ///// REMOVE ROOM TIMER

      for(var i = 0; i < rooms.length; i++){ //// REMOVE ROOM
        if(room.number == rooms[i].number){
          console.log('Se sterge camera '+ rooms[i].number + ' din cauze disconnectului');
          rooms.splice(i, 1);
        }
      }

      for(var i = 0; i < room.players.length; i++){
        for(var pla = 0; pla < nowPlaying.length; pla++){
          if(nowPlaying[pla].id === room.players[i].playerData.id){
            console.log('Game over => ' + nowPlaying[pla].id + ' a fost scos din nowPlaying !');
            nowPlaying.splice(pla, 1);
          }
        }
        if(room.players[i].playerData.id == player.playerData.id){
          room.players[i].score = -50;
          console.log(player.playerData.id + ' pierde 50 de puncte');
        }
        else{
          if(room.players[i].socket != null){
              room.players[i].socket.emit('game over', {winnerId: room.players[i].playerData.id});
          }
        }
      }
      updateDatabaseGameOver(room);
      console.log('Disconnected: %s sockets connected', connections.length);
  });



  socket.on('join room',  function(data){
    for(var pla = 0; pla < nowPlaying.length; pla++){
      console.log(data.id + ' vrea sa intre intr-o camera. El e de nivel ' + data.level);
      if(nowPlaying[pla].id === data.id){
        console.log('Din pacate ' + data.id + ' e deja activ');
        socket.emit('waiting', {roomNumber: -1});
        return;
      }
    }
    var newRoom = findMeARoom(data);
    if(newRoom == null){
        var maxRoomNumber = -1; var flag = 0;
        for(var i = 0; i < rooms.length; i++){
          if(rooms[i].number >= maxRoomNumber){
            maxRoomNumber = rooms[i].number;
          }
        }
        if(maxRoomNumber<0) maxRoomNumber = 0;
        console.log('Nu i-am gasit camera lui ' + data.id + ' de nivel ' + data.level);
        newRoom = {
        number: maxRoomNumber+1,
        name: 'room' + (maxRoomNumber+1),
        players: [{playerData: data, socket: socket, score: 0, answerSubmitted: false}],
        questions: questionsForRoomWithLevel(4, data.level),
        questionIndex: 0
      };
      rooms.push(newRoom);
      socket.join(newRoom.name, function(){
        console.log(socket.id + ' intra singur in camera ' + newRoom.number);
      });
      socket.emit('waiting', {roomNumber: newRoom.number});
      console.log(data.id + ' intra singur in camera ' + newRoom.number);
    }

    else{
      newRoom.players.push({playerData: data, socket: socket, score: 0, answerSubmitted: false});
      if(newRoom.players[0].socket != null){
          newRoom.players[0].socket.emit('enemy found', {enemyData: data, roomNumber: newRoom.number});
      }
      socket.emit('enemy found', {enemyData: newRoom.players[0].playerData, roomNumber: newRoom.number});
      console.log('I-am gasit camera cu adversar lui ' + data.id + '. Va intra in ' + newRoom.name);
      socket.join(newRoom.name, function(){
        console.log(socket.id + ' intra in ' + newRoom.name + ' in care il asteapta cineva');
      });

      refreshRoom(newRoom);
      var timer = setInterval(function(){
        refreshRoom(newRoom);
      }, 10000);
      roomTimers.push({roomName: newRoom.name, timer: timer});
    }
    nowPlaying.push(data);
  });

  socket.on('answer', function(data){
      console.log('Serverul a primit raspunsul ' + data.answer + ' de la jucatorul cu ID = ' + data.playerData.id + ' din camera ' + data.clientRoomName);
      var room = roomWithName(data.clientRoomName);

      for(var i = 0; i < room.players.length; i++){
        if(room.players[i].playerData.id == data.playerData.id){
        console.log(room.questions[room.questionIndex-1].questionText + '-> raspuns corect: ' + room.questions[room.questionIndex-1].correctAnswer + ' Raspuns venit: ' + data.answer);
          if(room.questions[room.questionIndex-1].correctAnswer == data.answer){
            console.log('A TRECUT TESTUL !!!');
            room.players[i].score = room.players[i].score + 10;
          }
        }
      }
    });

    socket.on('abandon', function(data){
      console.log('Serverul a primit abandon de la ' + data.playerData.id + ' din camera ' + data.clientRoomName);
      var room = roomWithName(data.clientRoomName);
      removeTimer(data.clientRoomName);  ///// REMOVE ROOM TIMER

      if(room == null){
        return;
      }

      for(var i = 0; i < rooms.length; i++){ //// REMOVE ROOM
        if(room.number == rooms[i].number){
          console.log('Se sterge camera '+ rooms[i].number + ' din cauze abandonului');
          rooms.splice(i, 1);
        }
      }

      for(var i = 0; i < room.players.length; i++){
        for(var pla = 0; pla < nowPlaying.length; pla++){
          if(nowPlaying[pla].id == room.players[i].playerData.id){
            console.log('Game over => ' + nowPlaying[pla].id + ' a fost scos din nowPlaying !');
            nowPlaying.splice(pla, 1);
          }
        }
      }

      if(data.grav){
        for(var i = 0; i < room.players.length; i++){
          if(room.players[i].playerData.id == data.playerData.id){
            room.players[i].score = -50;
            console.log(data.playerData.id + ' pierde 50 de puncte');
          }
          else{
            if(room.players[i].socket != null){
                room.players[i].socket.emit('game over', {winnerId: room.players[i].playerData.id});
            }
          }
        }
        updateDatabaseGameOver(room);
      }
    });

});

app.post('/joinroom', function(req, res){
  var postMan = req.body;
  if((postMan.id === undefined) || (postMan.name === undefined) || (postMan.level === undefined)){
    return res.status(404).json([
      {
        errorMessage: 'Invalid data format'
      }
    ])
  }
  if(!userExists(postMan.id)){
    return res.status(404).json([
      {
        errorMessage: 'User does not exist in the Fun@Web database'
      }
    ])
  }
  console.log("PostMan " + postMan.name + " vrea sa intre in camera !");
  for(var pla = 0; pla < nowPlaying.length; pla++){
    if(nowPlaying[pla].id == postMan.id){
      return res.status(404).json([
        {
          errorMessage: 'User already active in a room'
        }
      ])
    }
  }


  var newRoom = findMeARoom(postMan);
  var maxRoomNumber = 0;
  if(newRoom == null){
    for(var i = 0; i < rooms.length; i++){
      if(rooms[i].number >= maxRoomNumber){
        maxRoomNumber = rooms[i].number;
      }
    }
    maxRoomNumber = maxRoomNumber + 1;
    console.log('Nu i-am gasit camera lui ' + postMan.name);
    newRoom = {
    number: maxRoomNumber,
    name: 'room' + maxRoomNumber,
    players: [{playerData: postMan, socket: null, score: 0, answerSubmitted: false}],
    questions: questionsForRoomWithLevel(4, postMan.level),
    questionIndex: 0
  };
  rooms.push(newRoom);
  nowPlaying.push(postMan);

  console.log(postMan.name + ' intra singur in camera ' + newRoom.number);
  return res.json([
    {
      status: "Waiting...",
      room: auxiliary.trimRoomForJoinRoom(newRoom)
    }
  ]);
  }

  else{
    if(newRoom.players[0].playerData.id == postMan.id){
      return res.status(400).json([{message: 'You already are in this room. Pay attention !'}]);
    }
    newRoom.players.push({playerData: postMan, socket: null, score: 0, answerSubmitted: false});
    nowPlaying.push(postMan)
    if(auxiliary.socketsExistInRoom(newRoom)){
        newRoom.players[0].socket.emit('enemy found', {enemyData: postMan, roomNumber: newRoom.number});
    }

    /////// RASPUNS JSON INSTEAD socket.emit('enemy found', {enemyData: newRoom.players[0].playerData, roomNumber: newRoom.number});
    console.log('I-am gasit camera cu adversar lui ' + postMan.name + '. Va intra in ' + newRoom.name);
    refreshRoom(newRoom);
    var timer = setInterval(function(){
      refreshRoom(newRoom);
    }, 30000);
    roomTimers.push({roomName: newRoom.name, timer: timer});
    return res.json([
      {
        status: "Found an active room...",
        room: auxiliary.trimRoomForJoinRoom(newRoom)
      }
    ]);
  }
});


app.post('/answer', function(req, res){
  var postMan = req.body;
  if((postMan.playerData === undefined) || (postMan.playerData.id === undefined) || (postMan.playerData.name === undefined) || (postMan.roomNumber === undefined) ||
                  (postMan.roomNumber === undefined) ){
    return res.status(404).json([
      {
        errorMessage: 'Invalid data format'
      }
    ])
  }
  if(!userExists(postMan.playerData.id)){
    return res.status(404).json([
      {
        errorMessage: 'User does not exist in the Fun@Web database'
      }
    ])
  }
  console.log('Serverul a primit POST /answer de la ' + postMan.playerData.name + ' din camera ' + postMan.roomNumber);
  var room = roomWithNumber(postMan.roomNumber);
  if(room == null){
    return res.status(400).json([{message: 'The room you specified does not exist. Pay attention !'}]);
  }
  if(!userIsInRoomNumber(postMan.playerData, postMan.roomNumber)){
    return res.status(400).json([{message: 'You do not belong in the room you specified. Pay attention !'}]);
  }

  for(var i = 0; i < room.players.length; i++){
    if(room.players[i].playerData.id == postMan.playerData.id){
      if(room.players[i].answerSubmitted == true){
        return res.status(400).json([{message: 'You can submit your answer only once !'}])
      }
      room.players[i].answerSubmitted = true;
      console.log(room.questions[room.questionIndex-1].questionText + '-> raspuns corect: ' + room.questions[room.questionIndex-1].correctAnswer + ' Raspuns venit: ' + postMan.answer);
      if(room.questions[room.questionIndex-1].correctAnswer == postMan.answer){
      console.log(postMan.playerData.name + ' a raspuns corect :)');
      room.players[i].score = room.players[i].score + 10;
        return res.json([{message: "You answered correctly. Keep going !"}]);
      }
      console.log(postMan.playerData.name + ' a raspuns corect :(');
      return res.json([{message: "Sorry, that was wrong"}]);
    }
  }
});

app.get('/getRoomState', function(req, res){
  var postMan = {playerData: {id: '-1', name: 'gol', level: -1}, roomNumber: -1};
  if((req.query.id === undefined) || (req.query.name === undefined) || (req.query.level === undefined) ||
                  (req.query.roomNumber === undefined) ){
    return res.status(404).json([
      {
        errorMessage: 'Invalid data format'
      }
    ])
  }
  if(!userExists(parseInt(postMan.playerData.id))){
    return res.status(404).json([
      {
        errorMessage: 'User does not exist in the Fun@Web database'
      }
    ])
  }
  postMan.playerData.id = req.query.id; postMan.playerData.name = '' + req.query.name; postMan.playerData.level = req.query.level;
  postMan.roomNumber = req.query.roomNumber;
  console.log('Serverul a primit GET /getRoomState de la ' + postMan.playerData.name + ' din camera ' + postMan.roomNumber);
  var room = roomWithNumber(postMan.roomNumber);
  if(room == null){
    return res.status(400).json([{message: 'The room you specified does not exist. Pay attention !'}]);
  }
  if(!userIsInRoomNumber(postMan.playerData, postMan.roomNumber)){
    return res.status(400).json([{message: 'You do not belong in the room you specified. Pay attention !'}]);
  }
  if(userIsInRoomNumber(postMan.playerData, postMan.roomNumber)){
    var room = roomWithNumber(postMan.roomNumber);
    var questionText = '';
    var enemy = {};
    var players = [];
    var answers = [];

    if(room.players.length == 1){
      players = postMan.playerData;
      questionText = 'You do not have an enemy yet, therefore no question';
      answers = [];
    }
    else{
        questionText = room.questions[room.questionIndex-1].questionText;
        answers = room.questions[room.questionIndex-1].answers;
        if(room.players[0].playerData.id == postMan.playerData.id){
            enemy = auxiliary.trimEnemy(room.players[1]);
            players.push(room.players[0]);
            players.push(enemy);
          }
        else{
          enemy = auxiliary.trimEnemy(room.players[0]);
          players.push(room.players[1]);
          players.push(enemy);
        }
    }
    return res.json([
      {
        questionText: questionText,
        answers: answers,
        players: players
      }
    ]);
  }
  else{
    return res.status(400).json([{message: 'Could not get your question. You do not belong in the room you specified. Pay attention!'}]);
  }
});

app.post('/disconnect', function(req, res){
  var postMan = req.body;
  if((postMan.playerData === undefined) || (postMan.playerData.id === undefined) || (postMan.playerData.name === undefined) || (postMan.roomNumber === undefined) ||
                  (postMan.roomNumber === undefined) ){
    return res.status(404).json([
      {
        errorMessage: 'Invalid data format'
      }
    ])
  }
  if(!userExists(postMan.playerData.id)){
    return res.status(404).json([
      {
        errorMessage: 'User does not exist in the Fun@Web database'
      }
    ])
  }

  console.log('Serverul a primit POST /disconnect de la ' + postMan.playerData.name + ' din camera ' + postMan.roomNumber);
  var room = roomWithNumber(postMan.roomNumber);
  if(room == null){
    return res.status(400).json([{message: 'The room you specified does not exist. Pay attention !'}]);
  }
  if(!userIsInRoomNumber(postMan.playerData, postMan.roomNumber)){
    return res.status(400).json([{message: 'You do not belong in the room you specified. Pay attention !'}]);
  }

  removeTimer('room'+postMan.roomNumber);  ///// REMOVE ROOM TIMER

  for(var i = 0; i < rooms.length; i++){ //// REMOVE ROOM
    if(room.number == rooms[i].number){
      console.log('Se sterge camera '+ rooms[i].number + ' din cauze POST /disconnect');
      rooms.splice(i, 1);
    }
  }

  for(var i = 0; i < room.players.length; i++){
    for(var pla = 0; pla < nowPlaying.length; pla++){
      if(nowPlaying[pla].id === room.players[i].playerData.id){
        console.log('Game over => ' + nowPlaying[pla].id + ' a fost scos din nowPlaying !');
        nowPlaying.splice(pla, 1);
      }
    }
      if(room.players[i].playerData.id == postMan.playerData.id){
        room.players[i].score = -50;
        console.log(postMan.playerData.id + ' pierde 50 de puncte');
      }
      else{
        if(room.players[i].socket != null){
            room.players[i].socket.emit('game over', {winnerId: room.players[i].playerData.id});
        }
      }
    }
    res.json({message: 'Shame on you for disconnecting !'});
    updateDatabaseGameOver(room);
});

refreshRoom = function(room){
  room.players[0].answerSubmitted = false;
  room.players[1].answerSubmitted = false;
  if(room.questionIndex < room.questions.length){
      console.log('' + room.name + ' is refreshing');
      if(auxiliary.socketsExistInRoom(room)){
          io.in(room.name).emit('new question and score', {
            question: room.questions[room.questionIndex], ////////// !!!!!!!!!!!!!! REMOVE CORRECT ANSWER LATER !!!
            score: [{id: room.players[0].playerData.id, score: room.players[0].score}, {id: room.players[1].playerData.id, score: room.players[1].score}]
          });
          room.questionIndex = room.questionIndex + 1;
        }
      else{
          room.questionIndex = room.questionIndex + 1;
      }
  }
  else{
    console.log('In ' + room.name + ' s-au terminat intrebarile !');
    removeTimer(room.name);

    ///// IO.IN(ROOM.NAME).EMIT('GAME OVER', {CUM SA TERMINAT JOCUL, CINE A CASTIGAT ETC ...}{}) !!!!!!!!!!!! -----> PENTRU CLIENTII
    if(auxiliary.socketsExistInRoom(room)){
      if(room.players[0].score==room.players[1].score){
          io.in(room.name).emit('game over', {winnerId: 0});
      }
      if(room.players[0].score>room.players[1].score){
          io.in(room.name).emit('game over', {winnerId: room.players[0].playerData.id});
      }
      if(room.players[1].score>room.players[0].score){
          io.in(room.name).emit('game over', {winnerId: room.players[1].playerData.id});
      }
    };


    for(var i = 0; i < rooms.length; i++){
      if(room.number == rooms[i].number){
        console.log('Se sterge camera '+ rooms[i].number);
        rooms.splice(i, 1);
        for(var i = 0; i < room.players.length; i++){
          for(var pla = 0; pla < nowPlaying.length; pla++){
            if(nowPlaying[pla].id === room.players[i].playerData.id){
              console.log('Game over => ' + nowPlaying[pla].id + ' a fost scos din nowPlaying !');
              nowPlaying.splice(pla, 1);
            }
          }
        }
      }
    }
    //// UPDATE IN BAZA DE DATE LA CELE DOUA ID-URI POINTS , LEVEL , GAMES WON , GAMES PLAYED
    updateDatabaseGameOver(room);
  }
};

function userExists(id){
  return true;
}

function findMeARoom(userInfo) {  /////////  Pentru un user de un anumit nivel gaseste o camera

    for(var i = 0; i < rooms.length; i++){
      if( ( !isRoomFull(rooms[i]) ) && ( !auxiliary.isRoomEmpty(rooms[i]) ) && ( auxiliary.matchRoomUser(rooms[i], userInfo) )){
        return rooms[i];
      }
    }
    return null;
}

function removeTimer(roomName){
  for(var i = 0; i < roomTimers.length; i++){
    if(roomTimers[i].roomName == roomName){
      console.log('clearInterval pe ' + roomName);
      clearInterval(roomTimers[i].timer);
      roomTimers.splice(i, 1);
    }
  }
}

function userIsInRoomNumber(playerData, roomNumber){
  var room = roomWithNumber(roomNumber);
  console.log('Room number : ' + roomNumber);
  for(var i = 0; i < room.players.length; i++){
    if(playerData.id == room.players[i].playerData.id){
      return true;
    }
  }
  return false;
}

function roomWithNumber(number){
  for(var i = 0; i < rooms.length; i++){
    if(rooms[i].number == number){
      return rooms[i];
    }
  }
  return null;
}

function isRoomFull(room){ /////////////// Este camera plina  ?
  if(room.players.length<2) {
    return false;
  }
  else{
    return true;
  }
}

function roomWithName(roomName){
  for(var i = 0; i < rooms.length; i++){
    //console.log('|'+rooms[i].name + '|  comparat cu |'+roomName+'|')
    if(rooms[i].name == roomName){
      return rooms[i];
    }
  }
  return null;
}

function broadCastToAllSocketsRoomState(name, roomState) {

    for (var i = 0; i < connections.length; i++) {

        connections[i].socket.emit('question answers enemies', roomState);

    }

}

var timer = 1;

function sendTimer() {

    timer++;

    var roomState = {
      currentQuestion: "currentQuestionFromServer",
      answers: ["answer1FromServer", "answer2FromServer", "answer3FromServer"],
      correctAnswer: timer,
      enemies: ["pufarina", "lufarina", "de la server venim toti"]
    };

    //Broadcast the timer to all the sockets
    broadCastToAllSocketsRoomState('timer', roomState);

}

//Set the function to reapeat every second
setInterval(sendTimer, 1000);


function upsertLoggedPlayer(profile, accessToken, refreshToken){
  /////////////// UPSERT PLAYER//////////////////////////////////////////////////////
  return true;
}


function questionsForRoomWithLevel(howMany, level){

  ///////////////////////// INTEROGARE BD PT A OBTINE howMany intrebari in f de level

  return questionDB;
}


updateDatabaseGameOver = function(room){

///////////////////// UPDATE IN BD PENTRU FIECARE JUCATOR CU NR DE PUNCTE OBTINUTE JOCUL ASTA //////////////////////////////////////

  console.log('Update in DB ' + room.name);
  return true;
}




questionDB = [
{
  questionText: 'Secvență de caractere standardizată, folosită pentru localizarea unor resurse de pe Internet',
  answers: [ 'URL', 'WWW', 'DNS' ],
  correctAnswer: 0,
  level: 1
},

{
  questionText: 'Material scris sau grafic interconectat într-o manieră complexă care în mod convențional nu poate fi reprezentat pe hârtie',
  answers: [ 'Hyperlink', 'Document', 'Hypertext'],
  correctAnswer: 2,
  level: 2
},

{
  questionText: 'Care metoda HTTP actualizează o reprezentare de resursă sau eventual creează o resursă la nivel de server Web?',
  answers: [ 'PUT', 'HEAD', 'POST' ],
  correctAnswer: 2,
  level: 3
},

{
  questionText: 'Care este portul standard de acces HTTP?',
  answers: [ '66', '80', '3000' ],
  correctAnswer: 1,
  level: 3
}
];



// Bună seara,
// Sunt student in grupa IIB5 și am câteva nelămuriri legate de proiect.
// În primul rând îmi cer scuze dacă aceasta nu este calea potrivită prin care ar trebui să vi se adreseze un student.
// Proiectul la care mă refer este 8, Fun@Web. În cerința proiectului se spune doar atât: ”Pe baza API-ului creat, aliniat paradigmei REST, jocul va putea fi jucat si in grup via o platforma sociala precum Facebook ori Twitter, inclusiv pe telefoane mobile.”
// Eu am implementat deja o bună parte din server in express folosind socket.io(Web-socket) dar din câte mi-ați explicat la laborator comunicarea server-client trebuie să se facă folosind exclusiv metode din API REST. Înseamnă asta că nu ar trebui folosit web-socket? Cum afectează acest fapt folosirea aplicației din Facebook?
// În opinia mea descrierea este mult prea vagă și v-aș ruga să îmi spuneți mai în detaliu ce se așteaptă de la acest proiect și ce teste trebuie să trecă pentru a asigura promovarea materiei.
// Mulțumesc.
