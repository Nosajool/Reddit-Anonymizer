var express = require('express');
var router = express.Router();
var unirest = require('unirest');
var HashMap = require('hashmap').HashMap;
var FastSet = require("collections/fast-set");

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/jammedtoast');

var MAX_NUMBER_OF_CONVERSATIONS = 1;
var NUMBER_OF_FRONT_PAGE_THREADS = 5;
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

function parseHeader(response){
	var header = {};
	var thread = response.body[0].data.children[0].data;

	// Thread information
	header.subreddit = thread.subreddit;
	header.title = thread.title;
	header.url = thread.url;
	header.threadurl = "http://www.reddit.com" + thread.permalink;

	return header;
}

function parseConversations(response){
	//  Comment Data
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

	return conversations;
}

function getFrontPageThreads(callback){
	unirest.get("http://www.reddit.com/.json").end(function(response){
		if(response.error) {
			callback("error");
		}
		else {
			var front_page_threads = [];
			for(var i = 0; i < 5; i++){
				front_page_threads.push(response.body.data.children[i].data.permalink);
			}
			callback(front_page_threads);
		}
	});
}

/* GET home page. */
router.get('/', function(req, res) {
	getFrontPageThreads(function(threads){
		if(threads === "error"){
			res.send("Reddit is down");
		}
		else {
			res.render('index', { title: 'Reddit Anonymizer', front_page_threads: threads });
		}
	});
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
				var header = parseHeader(response);
				var conversations = parseConversations(response);

				res.render('index', { title: 'Reddit Anonymizer', conversations: conversations, header: header });
			}
		});
	});
});

module.exports = router;
