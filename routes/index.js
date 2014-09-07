var express = require('express');
var router = express.Router();
var unirest = require('unirest');

var MAX_NUMBER_OF_COMMENTS = 5;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Reddit Anonymizer' });
});

router.post('/anonymize', function(req, res){
	unirest.get(req.body.reddit_url + ".json")
		.end(function(response){
			if(response.error){
				res.send("Invalid URL");
			}
			else{
				var num_comments = response.body[0].data.children[0].data.num_comments;
				var comments = [];
				console.log("Number of Comments: " + num_comments);
				if(num_comments > MAX_NUMBER_OF_COMMENTS){
					console.log("Only taking 5 comments");
					num_comments = MAX_NUMBER_OF_COMMENTS;
				}
				else{
					console.log("we good");
				}
				for(var i = 0; i < num_comments; i++){
					console.log(i);
					comments.push(response.body[1].data.children[i].data.body);
				}
				res.render('index', { title: 'Reddit Anonymizer', comments: comments});
			}
		});
});

module.exports = router;
