var express = require('express'),
app = express(),
bodyParser = require('body-parser'),
customCatPhrase = require('./api/customCatPhraseAPI');
_ = require('lodash');

app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
//app.use(cookieParser());

// app.use(express.static(path.join(__dirname, 'client')));
//app.use(express.static('/client'));

var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type,x-username,x-token');
    next();
};

app.use(allowCrossDomain);

app.post('/getCustomCatPhrase',customCatPhrase.getCustomCatPhrase);
app.post('/actionCustomsCategoryPharse',customCatPhrase.actionCustomsCategoryPharse);


app.post('*', function(req, res){
    console.log("POST"+req.path);
    res.send(req.body);
});

/*https.createServer(credentials, app)
 .listen(port, function(){
console.log('SERVER LISTINIG ON ${ port }'+port);
});*/

PORT = 3003;

//amqp.connect('amqp://localhost', function(error0, connection) {
	app.listen(PORT, function () {
    		console.log('server start @port : '+PORT);
	});
//});

module.exports = app;