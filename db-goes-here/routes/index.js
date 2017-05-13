var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
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

//ADD FORM
router.get('/newquestion', function(req,res){
	res.render('newquest', {title: 'Add question'});
});

router.post('/addquestion', function(req,res){
	var MongoClient = mongodb.MongoClient;
 
    // Define where the MongoDB server is
    var url = 'mongodb://localhost:27017/sample';
 
    // Connect to the server
    MongoClient.connect(url, function(err, db){
      if (err) {
        console.log('Unable to connect to the Server:', err);
      } else {
        console.log('Connected to Server');
 
        // Get the documents collection
        var collection = db.collection('questions');
 
        // Get the student data passed from the form
        var q1 = {question: req.body.question, a1: req.body.a1,
          a2: req.body.a2, a3: req.body.a3, rightanswer: req.body.rightanswer};
 
        // Insert the student data into the database
        collection.insert([q1], function (err, result){
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
module.exports = router;
