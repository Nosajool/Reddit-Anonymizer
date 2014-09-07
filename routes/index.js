var express = require('express');
var router = express.Router();
var unirest = require('unirest');

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
				console.log(response.body);
				res.send(response.body);
			}
		});
});

module.exports = router;
