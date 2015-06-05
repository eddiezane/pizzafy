var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var multer     = require('multer');
var sendgrid   = require('sendgrid')(process.env.SENDGRID_APIKEY);
var mongoose   = require('mongoose');
var passport   = require('passport');
var Promise    = require('bluebird');

Promise.promisifyAll(mongoose);
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/pizzafy');

var User = require('./models/user.js');

app.set('port', process.env.PORT || 3000);

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(multer());

app.get('/', function(req, res) {
  res.send('hello');
});

app.listen(app.get('port'), function() {
  console.log('listening on ' + app.get('port'));
});
