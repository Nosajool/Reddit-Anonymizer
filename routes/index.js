var express = require('express');
var router = express.Router();
var unirest = require('unirest');
var HashMap = require('hashmap').HashMap;
var FastSet = require("collections/fast-set");

var MAX_NUMBER_OF_CONVERSATIONS = 1;


var nameMap = new HashMap();
var nameSet = new FastSet();

var names = [
	"bill",
	"bob",
	"yo",
	"a",
	"jam",
	"rock",
	"paper",
	"scissors",
	"mouse",
	"comment_data",
	"data",
	"floor",
	"blah",
	"ok",
	"MAX_NUMBER_OF_CONVERSATIONS"
];

function importNames() {
	for(var i = 0; i < names.length; i++) {
		nameSet.add(names[i]);
	}
}

function getNewNameFromList() {
	var rand_num = Math.floor((Math.random() * (nameSet.length-1)) + 0); 
	var newName = nameSet.toArray()[rand_num];
	nameSet.delete(newName);
	return newName;
}

function getName(name) {
	if(nameMap.has(name)) {
		return nameMap.get(name);
	} else {
		var newName = getNewNameFromList();
		nameMap.set(name, newName);
		return newName;
	}
}

function Conversation(user, body) {
	this.children = [];
	this.user = user;
	this.name = getName(user);
	this.body = body;
}

Conversation.prototype.addChildConversation = function(childConvo) {
	this.children.push(childConvo);
}

Conversation.prototype.addChild = function(user, body) {
	this.children.push(new Conversation(user, body));
};

Conversation.prototype.getChildren = function() {
	return this.children;
};

Conversation.prototype.populateReplies = function(currentComment) {
	var i = 0;
	var replyData = currentComment.replies.data;
	while (typeof(replyData) != 'undefined' && typeof(replyData.children[i]) != 'undefined') {
		if (replyData.children[i].kind != "more") {
			var reply = new Conversation(replyData.children[i].data.author, replyData.children[i].data.body);
			reply.populateReplies(replyData.children[i].data)
			this.addChildConversation(reply);
		}
		i++;
	}
}

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Reddit Anonymizer' });
});

router.post('/', function(req, res) {
	importNames();
	unirest.get(req.body.reddit_url + ".json").end(function(response) {
		if(response.error) {
			res.send("Invalid URL");
		}
		else{
			var thread = response.body[0].data.children[0].data;
			var comment_data = response.body[1].data;
			var num_conversations = thread.num_comments;
			var conversations = [];

			if(num_conversations > MAX_NUMBER_OF_CONVERSATIONS) {
				num_conversations = MAX_NUMBER_OF_CONVERSATIONS;
			}

			for(var i = 0; i < num_conversations; i++) {
				// push the first comment of conversation
				var currentComment = comment_data.children[i].data;
				var conversation = new Conversation(currentComment.author, currentComment.body);
				// populate first comment's replies
				conversation.populateReplies(currentComment);

				conversations.push(conversation);
			}

			res.render('index', { title: 'Reddit Anonymizer', conversations: conversations});
		}
	});
});

module.exports = router;
