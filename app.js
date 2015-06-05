/*
 * Initial imports
 */
var express      = require('express');
var app          = express();
var multer       = require('multer');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var hbs          = require('express-hbs');
var validator    = require('express-validator');
var logger       = require('morgan');
var flash        = require('express-flash');
var lusca        = require('lusca');
var errorHandler = require('errorhandler');
var passport     = require('passport');
var mongoose     = require('mongoose');
var MongoStore   = require('connect-mongo')(session); 
var Promise      = require('bluebird');

if (app.get('env') === 'development') {
    require('dotenv').load();
}

var sendgrid = require('sendgrid')(process.env.SENDGRID_APIKEY);

Promise.promisifyAll(mongoose);
mongoose.connect(process.env.MONGOLAB_URI);

var User = require('./models/user.js');

app.set('port', process.env.PORT || 3000);
app.engine('hbs', hbs.express4({
    partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

var passportConfig = require('./config/passport.js');

app.use(express.static('public'));
app.use(logger('dev'));
app.use(multer());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({ url: process.env.MONGOLAB_URI, autoReconnect: true })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca({
  csrf: true,
  xframe: 'SAMEORIGIN',
  xssProtection: true
}));

app.get('/', function(req, res) {
  res.render('index', {
    title: 'Pizzafy',
    layout: 'layouts/home'
  });
});

app.get('/login', function(req, res) {
  if (req.user) {
    res.redirect('/');
  }

  res.render('login', {
    title: 'Pizzafy',
    layout: 'layouts/home'
  });
});

app.get('/signup', function(req, res) {
  res.render('signup', {
    title: 'Pizzafy',
    layout: 'layouts/home'
  });
});

app.post('signup', function(req, res) {
  // Needs csrf
  res.end();
});

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect: '/login'}), function(req, res) {
  res.redirect('/');
});

app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', {failureRedirect: '/login'}), function(req, res) {
  res.redirect('/');
});


if (app.get('env') === 'development') {
  app.use(errorHandler());
}

app.listen(app.get('port'), function() {
  console.log('listening on ' + app.get('port'));
});
