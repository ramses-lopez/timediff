var express = require('express');
var app = express();

app.use('/config', express.static(__dirname + '/js'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/img', express.static(__dirname + '/img'));
app.use('/html', express.static(__dirname + '/html'));
app.use('/lib', express.static(__dirname + '/bower_components'));
app.use('/node', express.static(__dirname + '/node_modules'));
app.use('/lang', express.static(__dirname + '/lang'));

app.all('/*', function(req, res, next) {
	// Just send the index.html for other files to support HTML5Mode
	res.sendFile('index.html', { root: __dirname });
});

port = process.env.PORT || 3001;

app.listen(port, function () {
	console.log('SomoSport Competition Portal > http://locahost:' + port);
});
