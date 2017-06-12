var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var MongoClient = mongodb.MongoClient;
 
    // Define where the MongoDB server is
    var url = 'mongodb://DummyUser:10laTW@ds137891.mlab.com:37891/tw';
 var options = {
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
};
    // Connect to the server
MongoClient.connect(url, options, function(err, db){
      if (err) {
        console.log('Unable to connect to the Server:', err);
      } else {
        console.log('Connected to Server');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/questions', function(req, res){
  
      var collection = db.collection('Questions');

      collection.find({}).toArray(function(err,result){
        if(err){
          res.send(err);
        } else if (result.length){
          var res2 = result.slice(3);
          res.render('quest', {"quest" : res2});
        } else{
          res.send('Database is empty.');
        }

      });
    }
);

router.get('/finish', function(req,res){
  res.render('finish', {title: 'Game finished.'});
});

router.post('/endgame', function(req, res){
  
      var collection = db.collection('Statistics');
      var col2 = db.collection('Users');
      
      col2.update({"first_name" : 'Duhmi'}, {$inc: {"gamecount" :1}});
      col2.findOne({"first_name" : 'Duhmi'}).then(function(value){console.log(value); col2.update({ _id: value._id},{ $set: {points: value.gamecount, level: Math.floor(value.gamecount/10)}})}); 
      collection.update({},{ $inc: { "Games": 1} });
      
      res.redirect("checkstats");
        //Where do I close it?    
      });

//ADD FORM
router.get('/newquestion', function(req,res){
  res.render('newquest', {title: 'addquestion'});
});


router.post('/addquestion', function(req,res){
  
      
        // Get the documents collection
        var collection = db.collection('Questions');
 
        // Get the student data passed from the form
        var q1 = {question: req.body.quest, a1: req.body.a1,
          a2: req.body.a2, a3: req.body.a3, rightanswer: req.body.rightanswer, diff: req.body.diff};
 
        // Insert the student data into the database
        collection.save(q1, function (err, result){
          if (err) {
            console.log(err);
          } else {
 
            // Redirect to the updated student list
            res.redirect("questions");
          }
 
          // Close the database
        });
 
      
    });
 


router.get('/checkstats', function(req, res){
      var collection = db.collection('Statistics');

      collection.find({}).toArray(function(err,result){
        if(err){
          res.send(err);
        } else if (result.length){
          res.render('checkstats', {"checkstats" : result});
        } else{
          res.send('Database is empty.');
        }

      });
  });

///////////////////////////

router.get('/mocklog', function(req,res){
  res.render('mocklog', {title: 'mocklog'});
});


///////////////////////////

router.post('/userlog', function(req,res){
 
        // Get the documents collection
        var collection = db.collection('Users');
 
        // Get the student data passed from the form
        //var q1 = {question: req.body.question, a1: req.body.a1,
          //a2: req.body.a2, a3: req.body.a3, rightanswer: req.body.rightanswer, diff: req.body.diff};
        //var bulk = db.items.initializeUnorderedBulkOp();
        // Insert the student data into the database
        collection.update({"first_name": req.body.first_name, "last_name": req.body.last_name}, { $set: {"gender": req.body.gender, "gamecount": req.body.gamecount, "points": req.body.points, "accesstoken": req.body.accesstoken, "refreshtoken": req.body.refreshtoken, "photo": "1" }}, { upsert: true }, function (err, result){
          if (err) {
            console.log(err);
          } else {
 
            // Redirect to the updated student list
            res.redirect("questions");
          }
          //user = collection.findOne({"first_name": req.body.first_name, "last_name": req.body.last_name});

 
          // Close the database
        });
        /*bulk.find({'first_name': req.body.first_name, 'last_name': req.body.last_name}).upsert().update({
          'gender': req.body.gender, 
          'gamecount': req.body.gamecount, 
          'points': req.body.points, 
          'accesstoken': req.body.accesstoken, 
          'refreshtoken': req.body.refreshtoken
        }
        );
        bulk.execute();
        db.close();*/

    });
 }});
module.exports = router;
