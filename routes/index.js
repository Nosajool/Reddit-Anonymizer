var express = require('express');
var router = express.Router();
var unirest = require('unirest');

var MAX_NUMBER_OF_CONVERSATIONS = 5;

function Comment(user, body){
	this.user = user;
	this.body = body;
}

function Conversation(){
	this.comments = [];
}

Conversation.prototype.addComment = function(user, body){
	this.comments.push(new Comment(user, body));
};

Conversation.prototype.getComments = function(){
	return this.comments;
};

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
				var thread = response.body[0].data.children[0].data;
				var comment_data = response.body[1].data;
				var num_conversations = thread.num_comments;
				var conversations = [];

				if(num_conversations > MAX_NUMBER_OF_CONVERSATIONS){
					num_conversations = MAX_NUMBER_OF_CONVERSATIONS;
				}

				for(var i = 0; i < num_conversations; i++){
					var conversation = new Conversation();

					// push the first comment
					var currentComment = comment_data.children[i].data;
					conversation.addComment(currentComment.author, currentComment.body);
					// push the first comment of the children
					while(typeof(currentComment.replies.data) != "undefined"){
						console.log("got here");
						currentComment = currentComment.replies.data.children[0].data;
						conversation.addComment(currentComment.author, currentComment.body);
					}

					conversations.push(conversation);
					console.log(conversation);
				}

				res.render('index', { title: 'Reddit Anonymizer', conversations: conversations});
			}
		});
});

module.exports = router;
