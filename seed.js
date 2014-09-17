// Run `node seed`

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/jammedtoast');

var collection = db.get('namecollection');
// Clear database
collection.drop();
console.log("namecollection dropped");	

var hpData = [
	"Harry Potter",
	"Ron Weasley",
	"Hermione Granger",
	"Albus Dumbuldore",
	"Severous Snape",
	"Hannah Abbott",
	"Katie Bell",
	"Bill",
	"Bob"
];

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

for(var i = 0; i < hpData.length; i++){
	console.log("Adding " + hpData[i] + " to Harry Potter");
	collection.insert({
		name: hpData[i],
		theme: "Harry Potter"
	}, function(err, doc){
		if(err) throw err;
	});
}

for(var i = 0; i < bbtData.length; i++){
	console.log("Adding " + bbtData[i] + " to Big Bang Theory");
	collection.insert({
		name: bbtData[i],
		theme: "Big Bang Theory"
	}, function(err, doc){
		if(err) throw err;
	});
}