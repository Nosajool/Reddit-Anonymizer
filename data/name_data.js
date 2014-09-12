var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/jammedtoast');

var collection = db.get('namecollection');

var bbtData = [
	"Leonard Hofstadter",
	"Sheldon Cooper",
	"Howard Wolowitz",
	"Penny",
	"Raj Koothrappali",
	"Leslie Winkle",
	"Bernadette Rostenkowski-Wolowitz",
	"Amy Farrah Fowler",
	"Stuart Bloom",
	"Alex Jensen",
	"Barry Kripke",
	"Beverly Hofstadter",
	"Dr. Eric Gablehauser",
	"Dr. and Mrs. Koothrappali",
	"Lucy",
	"Mary Cooper",
	"Priya Koothrappali",
	"Stephanie Barnett",	
	"Wil Wheaton",
	"Mrs. Wolowitz",
	"Zack Johnson"
];

module.exports = {
  hp: function(){
  	var names = [];
  	collection.find({ theme: "Harry Potter" }, function(err, docs){
  		for(var i = 0; i < docs.length; i++){
  			names.push(docs[i].name);
  		}
	  	console.log(names);
	  	return names;
  	});
  },

  bbt: function(){
  	return bbtData;
  }
};

db.close();