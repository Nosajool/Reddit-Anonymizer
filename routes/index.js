var express = require('express');
var router = express.Router();
var unirest = require('unirest');

var MAX_NUMBER_OF_COMMENTS = 5;

function Comment(user, body){
	this.user = user;
	this.body = body;
}

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Reddit Anonymizer' });
});

router.post('/anonymize', function(req, res){
	unirest.get(req.body.reddit_url + ".json")
		.end(function(response){

			var thread = response.body[0].data.children[0].data;
			var comment_data = response.body[1].data;

			if(response.error){
				res.send("Invalid URL");
			}
			else{
				var num_comments = thread.num_comments;
				var comments = [];

				if(num_comments > MAX_NUMBER_OF_COMMENTS){
					num_comments = MAX_NUMBER_OF_COMMENTS;
				}

				for(var i = 0; i < num_comments; i++){
					var comment = new Comment(comment_data.children[i].data.author, comment_data.children[i].data.body);
					comments.push(comment);
				}

				res.render('index', { title: 'Reddit Anonymizer', comments: comments});
			}
		});
});

module.exports = router;
