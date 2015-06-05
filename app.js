var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var multer         = require('multer');
var sendgrid       = require('sendgrid')(process.env.SENDGRID_APIKEY);
var mongoose       = require('mongoose');
var hbs            = require('express-hbs');
var cookieParser   = require('cookie-parser');
var session        = require('express-session');
var Promise        = require('bluebird');
var passport       = require('passport');

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

var passportConfig = require('./config/passport.js');

app.use(express.static('public'));
app.use(multer());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({secret: process.env.SESSION_SECRET}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/login', function(req, res) {
  res.send('login page');
});

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect: '/login'}), function(req, res) {
  res.redirect('/');
});

app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', {failureRedirect: '/login'}), function(req, res) {
  res.redirect('/');
});

app.listen(app.get('port'), function() {
  console.log('listening on ' + app.get('port'));
});
