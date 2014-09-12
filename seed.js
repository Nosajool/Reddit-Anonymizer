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
for(var i = 0; i < hpData.length; i++){
	console.log("Adding " + hpData[i] + " to Harry Potter");
	collection.insert({
		name: hpData[i],
		theme: "Harry Potter"
	}, function(err, doc){
		if(err) throw err;
	});
}