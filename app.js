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
app.use(validator());
app.use(lusca({
  csrf: true,
  xframe: 'SAMEORIGIN',
  xssProtection: true
}));
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});


app.get('/', function(req, res) {
  res.render('landing', {
    title: 'Pizzafy',
    layout: 'layouts/home'
  });
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/login', function(req, res) {
  if (req.user) {
    res.redirect('/profile');
  }

  res.render('socialLogin', {
    title: 'Pizzafy',
    layout: 'layouts/home'
  });
});

app.get('/profile', passportConfig.isAuthenticated, function(req, res) {
  res.render('form', {
    title: 'Pizzafy',
    layout: 'layouts/profile'
  });
});

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect: '/login'}), function(req, res) {
  res.redirect('/profile');
});

app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', {failureRedirect: '/login'}), function(req, res) {
  res.redirect('/profile');
});

app.post('/auth/local/signup', function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('passwordConfirmation', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    console.log('baaaaaaaaad', errors);
    return res.redirect('/');
  }

  var user = new User({
    email: req.body.email,
    password: req.body.password
  });

  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      req.flash('errors', { msg: 'Account with that email address already exists.' });
      return res.redirect('/');
    }

    user.save(function(err) {
      if (err) return next(err);
      req.logIn(user, function(err) {
        if (err) return next(err);
        res.redirect('/profile');
      });
    });
  });
});

app.post('/auth/local/login', passport.authenticate('local', { failureRedirect: '/login' }), function(req, res) {
  res.redirect('/profile');
});

if (app.get('env') === 'development') {
  app.use(errorHandler());
}

app.listen(app.get('port'), function() {
  console.log('listening on ' + app.get('port'));
});
