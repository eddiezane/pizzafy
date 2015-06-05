var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var multer     = require('multer');
var sendgrid   = require('sendgrid')(process.env.SENDGRID_APIKEY);
var mongoose   = require('mongoose');
var hbs        = require('express-hbs');
var passport   = require('passport');
var Promise    = require('bluebird');

if (app.get('env') === 'development') {
    require('dotenv').load();
}

Promise.promisifyAll(mongoose);
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/pizzafy');

var User = require('./models/user.js');

app.set('port', process.env.PORT || 3000);
app.engine('hbs', hbs.express4({
    partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(multer());

require('./config/passport.js');

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/login/facebook', passport.authenticate('facebook'), function(req, res) {

});

app.get('/login/twitter', passport.authenticate('twitter'), function(req, res) {
  res.send('logged in');
});

app.listen(app.get('port'), function() {
  console.log('listening on ' + app.get('port'));
});
