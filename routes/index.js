var express = require('express');
var router = express.Router();
var unirest = require('unirest');
var HashMap = require('hashmap').HashMap;
var FastSet = require("collections/fast-set");

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/jammedtoast');

var MAX_NUMBER_OF_CONVERSATIONS = 1;
var collection = db.get('namecollection');

var nameMap = new HashMap();
var nameSet = new FastSet();

function fetchFromDB(themeName, callback){
	collection.find({ theme: themeName }, function(err, docs){
		if(err){
			callback("error");
		}
		var names = [];
		for(var i = 0; i < docs.length; i++){
  			names.push(docs[i].name);
  		}
  		callback(names);
	});
}

function themeArray(theme, callback){
	console.log(theme);
	fetchFromDB(theme, function(names){
		// If the theme chosen does not exist in the database, default to harry potter
		if(names === "error"){
			fetchFromDB("Harry Potter", function(hpNames){
				return callback(hpNames);
			})
		}
		// The theme exists in the database
		else{
			return callback(names);
		}
	})
}

function importNames(theme, callback) {
	themeArray(theme, function(themes){
		for(var i = 0; i < themes.length; i++) {
			nameSet.add(themes[i]);
		}
		callback();
	});
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
	var replyData = currentComment.replies.data;
	if (typeof(replyData) != 'undefined' && typeof(replyData.children[0]) != 'undefined') {
		if (replyData.children[0].kind != "more") {
			var reply = new Conversation(replyData.children[0].data.author, replyData.children[0].data.body);
			reply.populateReplies(replyData.children[0].data)
			this.addChildConversation(reply);
		}
	}
}

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Reddit Anonymizer' });
});

router.post('/', function(req, res) {
	nameMap = new HashMap();
	nameSet = new FastSet();
	importNames(req.body.theme, function(){
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
});

module.exports = router;
