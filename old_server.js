var unirest = require('unirest');
var express = require('express');
var events = require('events');

var getFromApi = function(endpoint, args) {
    var emitter = new events.EventEmitter();
    unirest.get('https://api.spotify.com/v1/' + endpoint)
           .qs(args)
           .end(function(response) {
               emitter.emit('end', response.body);
            });
    return emitter;
};

var app = express();
app.use(express.static('public'));

function onSearchEnd (req, res, next) {
    var artist = req.artists.items[0];
    var relatedReq = getFromApi('artists/' + artist.id + '/related-artists');
    relatedReq.on('end', function addRelated (artistArray) {
        req.artist.related = artistArray.artists;
        next();
    });
}

function searchRequest (req, res, next) {
    var searchReq = getFromApi('search', {
        q: req.params.name,
        limit: 1,
        type: 'artist'
    });
    searchReq.on('end', function(data) {
        req.artist = data;
        next();
    });
}

var middleware = [searchRequest, onSearchEnd];

app.get('/search/:name', middleware, function(req, res) {
    res.json(req.artist);
});

app.use(function(error, req, res, next) {
    if (error) {
        res.status(404);
    }
    next();
});

app.listen(8080);