var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/questions', function(req, res){
	var MongoClient=mongodb.MongoClient;

	var url = 'mongodb://DummyUser:10laTW@ds137891.mlab.com:37891/tw';

	MongoClient.connect(url, function(err,db){
		if(err){
			console.log('Unable to connect to server.', err);
		}
		else{
			console.log('We are connected.');
			var collection = db.collection('Questions');

			collection.find({}).toArray(function(err,result){
				if(err){
					res.send(err);
				} else if (result.length){
					res.render('quest', {"quest" : result});
				} else{
					res.send('Database is empty.');
				}

				db.close();
			});
		}
	});
});

router.get('/finish', function(req,res){
  res.render('finish', {title: 'Game finished.'});
});

router.post('/endgame', function(req, res){
  var MongoClient=mongodb.MongoClient;

  var url = 'mongodb://DummyUser:10laTW@ds137891.mlab.com:37891/tw';

  MongoClient.connect(url, function(err,db){
    if(err){
      console.log('Unable to connect to server.', err);
    }
    else{
      console.log('We are connected.');
      var collection = db.collection('Statistics');
      var col2 = db.collection('Users');
      //Trebuie sa definim cum identificam userii care joaca.
      
      col2.update({"first_name" : 'Duhmi'},{ $inc: {"gamecount" :1} }, function (err, result){
        if (err) {
            console.log(err);
          } else {
 
            // Redirect to the updated student list
         //   res.redirect("checkstats");
          };
         });


      collection.update({},{ $inc: { "Games": 1} }, function (err, result){
        if (err) {
            console.log(err);
          } else {
 
            // Redirect to the updated student list
           // res.redirect("checkstats");
          };
        db.close();
         });
      res.redirect("checkstats");
      }});
});

//ADD FORM
router.get('/newquestion', function(req,res){
	res.render('newquest', {title: 'addquestion'});
});


router.post('/addquestion', function(req,res){
	var MongoClient = mongodb.MongoClient;
 
    // Define where the MongoDB server is
    var url = 'mongodb://DummyUser:10laTW@ds137891.mlab.com:37891/tw';
 
    // Connect to the server
    MongoClient.connect(url, function(err, db){
      if (err) {
        console.log('Unable to connect to the Server:', err);
      } else {
        console.log('Connected to Server');
 
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
          db.close();
        });
 
      }
    });
 
});

router.get('/checkstats', function(req, res){
  var MongoClient=mongodb.MongoClient;

  var url = 'mongodb://DummyUser:10laTW@ds137891.mlab.com:37891/tw';

  MongoClient.connect(url, function(err,db){
    if(err){
      console.log('Unable to connect to server.', err);
    }
    else{
      console.log('We are connected.');
      var collection = db.collection('Statistics');

      collection.find({}).toArray(function(err,result){
        if(err){
          res.send(err);
        } else if (result.length){
          res.render('checkstats', {"checkstats" : result});
        } else{
          res.send('Database is empty.');
        }

        db.close();
      });
    }
  });
});


///////////////////////////

router.get('/mocklog', function(req,res){
  res.render('mocklog', {title: 'mocklog'});
});


///////////////////////////

router.post('/userlog', function(req,res){
  var MongoClient = mongodb.MongoClient;
 
    // Define where the MongoDB server is
    var url = 'mongodb://DummyUser:10laTW@ds137891.mlab.com:37891/tw';
 
    // Connect to the server
    MongoClient.connect(url, function(err, db){
      if (err) {
        console.log('Unable to connect to the Server:', err);
      } else {
        console.log('Connected to Server');
 
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
          db.close();
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
      }
    });
 
});

module.exports = router;
