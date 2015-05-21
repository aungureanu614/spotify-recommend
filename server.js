var unirest = require('unirest');
var express = require('express');
var app = express();
app.use(express.static('public'));

function getFromApi (endpoint, args, callback) {
	return unirest.get('https://api.spotify.com/v1/' + endpoint)
		.qs(args)
		.end(function(response) {
			return callback(response.body);
		});
}

function onSearchEnd (req, res, next) {
	var artist = req.search.body.artists.items[0];
	getFromApi('artists/' + artist.id + '/related-artists',null,
		function addRelated (artistArray) {
			artist.related = artistArray.artists;
			res.send(artist);
		}
	);
}

function searchReq (req, res, next) {
	var options = {
		q: req.params.name,
		limit: 1,
		type: 'artist'
	}
}

getFromApi('search',options,function(body) {
	req.search = body;
	next();
});


var middleware = [searchReq, onSearchEnd];

app.get('/search/:name', middleware, function(req, res) {
});

app.use(function(err,res,req,next){
	if(err)next(err);
});

app.listen(8080,function(){
	console.log("App listening on http://localhost:%d", 8080);
});