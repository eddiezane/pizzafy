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
var crypto       = require('crypto');
var uuid         = require('node-uuid');
var request      = require('request');
var Promise      = require('bluebird');

var toppings     = require('./config/toppings.json');
var crusts       = require('./config/crust.json');
var dietary      = require('./config/dietary.json');

if (app.get('env') === 'development') {
    require('dotenv').load();
}

var sendgrid = require('sendgrid')(process.env.SENDGRID_APIKEY);

Promise.promisifyAll(mongoose);
mongoose.connect(process.env.MONGOLAB_URI);

var User = require('./models/user.js');
var Event = require('./models/event.js');

app.set('port', process.env.PORT || 3000);
app.engine('hbs', hbs.express4({
    partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

hbs.registerHelper('grouped_each', function(every, context, options) {
  var out = "", subcontext = [], i;
  if (context && context.length > 0) {
    for (i = 0; i < context.length; i++) {
      if (i > 0 && i % every === 0) {
        out += options.fn(subcontext);
        subcontext = [];
      }
      subcontext.push(context[i]);
    }
    out += options.fn(subcontext);
  }
  return out;
});

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
// app.use(lusca({
  // csrf: true,
  // xframe: 'SAMEORIGIN',
  // xssProtection: true
// }));
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

app.post('/test', function(req, res) {
  console.log(req.body);
  res.end();
});

app.get('/', function(req, res) {
  res.render('landing', {
    title: 'Pizzafy',
    layout: 'layouts/home'
  });
});

app.get('/about', function(req, res) {
  res.render('about', {
    title: 'Pizzafy',
    layout: 'layouts/home'
  });
});

app.get('/contact', function(req, res) {
  res.render('contact', {
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
    return res.redirect('/profile');
  }

  res.render('login', {
    title: 'Pizzafy',
    layout: 'layouts/home'
  });
});

app.get('/profile', passportConfig.isAuthenticated, function(req, res) {
  var allToppings = JSON.parse(JSON.stringify(toppings)).map(function(item) {
    return {name: item};
  });

  req.user.pizza.toppings.forEach(function(favoriteTopping) {
    allToppings.forEach(function(topping, index) {
      if (topping.name == favoriteTopping) {
        allToppings[index].checked = true;
      }
    });
  });


  var crustSet = false;
  var allCrusts = JSON.parse(JSON.stringify(crusts)).map(function(item) {
    var crust = {name: item};
    if (req.user.pizza.crust === item) {
      crust.checked = true;
    }
    return crust;
  });

  if (!crustSet) allCrusts[0].checked = true;

  var allDietary = JSON.parse(JSON.stringify(dietary)).map(function(item) {
    return {name: item};
  });

  req.user.pizza.dietary.forEach(function(userDietaryItem) {
    allDietary.forEach(function(dietaryItem, index) {
      if (dietaryItem.name == userDietaryItem) {
        allDietary[index].checked = true;
      }
    });
  });

  res.render('profile/form', {
    title: 'Pizzafy',
    layout: 'layouts/profile',
    toppings: allToppings,
    crusts: allCrusts,
    dietary: allDietary,
    notes: req.user.pizza.notes,
    firstName: req.user.profile.firstName,
    lastName:req.user.profile.lastName,
    email: req.user.email
  });
});

app.post('/profile', passportConfig.isAuthenticated, function(req, res) {
  req.user.pizza.pizzaNumber = parseInt(req.body.pizzaNumber);
  req.user.pizza.toppings = req.body.toppings;
  req.user.pizza.hates = req.body.hates;
  req.user.pizza.crust = req.body.crust;
  req.user.pizza.dietary = req.body.dietary;
  req.user.pizza.notes = req.body.notes
  req.user.profile.displayName = req.body.firstName + req.body.lastName;
  req.user.profile.firstName = req.body.firstName;
  req.user.profile.lastName = req.body.lastName;
  req.user.email = req.user.email || req.body.email;

  req.user.save();

  req.flash('success', {msg: 'Successfully Updated!'});

  res.redirect('/profile');
});

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect: '/login'}), function(req, res) {
  res.redirect('/profile');
});

app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', {failureRedirect: '/login'}), function(req, res) {
  res.redirect('/profile');
});

app.get('/auth/meetup', passport.authenticate('meetup'));
app.get('/auth/meetup/callback', passport.authenticate('meetup', {failureRedirect: '/login'}), function(req, res) {
  res.redirect('/profile');
});

app.get('/auth/eventbrite', passport.authenticate('eventbrite'));
app.get('/auth/eventbrite/callback', passport.authenticate('eventbrite', {failureRedirect: '/login'}), function(req, res) {
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

  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (err) {
      console.error('BAAAAAAAAAD', err);
    }

    if (existingUser) {
      req.flash('errors', { msg: 'Account with that email address already exists.' });
      return res.redirect('/');
    }

    User.create({
      email: req.body.email,
      password: req.body.password,
      profile: {
        picture: getGravatar(req.body.email)
      }
    }, function(err, user) {
      if (err) {
        console.error('Error creating local user', err);
      }

      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect('/profile');
      });

    });
  });
});

app.post('/auth/local/login', function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) return next(err);
    if (!user) {
      req.flash('errors', { msg: info.message });
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect('/profile');
    });
  })(req, res, next);
});

app.get('/api/toppings', function(req, res) {
  res.json(toppings);
});

app.get('/api/events', passportConfig.isAuthenticated, function(req, res) {
  res.json(req.user.events);
});

// app.get('/profile/events', passportConfig.isAuthenticated, function(req, res) {
app.get('/profile/events', function(req, res) {
  var eventIds = req.user.events;

  Event.find({
    '_id': { 
      $in: eventIds
    }
  }, function(err, events) {
    if (err) console.error('BAAAAAAAAAAAAAA', err);

    events.forEach(function(event) {
      if (req.user._id.toString() != event.host.toString()) {
        event.host = null;
      }
    });
    

    res.render('profile/events', {
      title: 'Pizzafy',
      layout: 'layouts/profile',
      events: events
    });
  });
});

// app.get('/profile/events/new', passportConfig.isAuthenticated, function(req, res) {
app.get('/profile/events/new', function(req, res) {
  res.render('profile/newEvent', {
    title: 'Pizzafy',
    layout: 'layouts/profile'
  });
});

// app.get('/profile/events/:id', passportConfig.isAuthenticated, function(req, res) {
app.get('/profile/events/:id', function(req, res) {
  Event.findById(req.params.id, function(err, event) {
    if (err) {
      req.flash('error', {msg: err});
      return res.redirect('/profile/events');
    }

    if (!event) {
      req.flash('error', {msg: 'Event not found!'});
      return res.redirect('/profile/events');
    }

    User.find({
      '_id': { 
        $in: event.attendees
      }
    }, function(err, attendees) {
      if (err) console.error('BAAAAAAAAAAAAAA', err);
      res.render('profile/singleEvent', {
        title: 'Pizzafy',
        layout: 'layouts/profile',
        event: event,
        attendees: attendees,
        webhookHost: process.env.PIZZAFY_WEBHOOK_HOST,
        eventId: req.params.id
      });
    });

  });
});

app.post('/profile/events', passportConfig.isAuthenticated, function(req, res) {
  req.assert('eventName', 'Event name is required').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/profile/events/new');
  }

  var user = req.user;

  var event = new Event();
  event.name = req.body.eventName;
  event.host = user._id;
  event.attendees.push(user._id);
  event.webhookUrl = uuid.v4();
  event.save();

  user.events.push(event._id);
  user.save();

  req.flash('success', 'Event created!');
  res.redirect('/profile/events');
});

app.post('/webhooks/eventbrite/:id', function(req, res) {
  res.end();

  request.get({
    url: req.body.api_url,
    headers: {
      authorization: "Bearer " + process.env.EVENTBRITE_KEY
    }
  }, function(err, resp, body) {

    Event.findOne({webhookUrl: req.params.id}, function(err, event) {
      if (event) {
        User.findOne({email: JSON.parse(body).email}, function(err, user) {
          if (user) {
            user.update({$addToSet: {events: event._id}}, null, function(err, _) {
              event.update({$addToSet: {attendees: user._id}}, null, function(err, _) {
              });
            });
          }
        });
      }
    });

  });

});

app.get('/profile/connect/eventbrite', passportConfig.isAuthenticated, function(req, res) {
  var eventId = req.query.eventId;

  request({
    url: 'https://www.eventbriteapi.com/v3/users/me/owned_events/',
    headers: {
      authorization: 'Bearer ' + req.user.eventbriteToken
    },
    json: true
  }, function(err, resp, body) {
    var events = body.events.map(function(event) {
      var e = {};
      e.id = event.id;
      e.url = event.url;
      e.name = event.name.text;

      return e;
    });

    res.render('profile/connect/eventbrite', {
      title: 'Pizzafy',
      layout: 'layouts/profile',
      events: events
    });
  });
});

if (app.get('env') === 'development') {
  app.use(errorHandler());
}

app.listen(app.get('port'), function() {
  console.log('listening on ' + app.get('port'));
});

function getGravatar(email, size) {
  if (!size) size = 200;
  if (!email) return 'https://gravatar.com/avatar/?s=' + size + '&d=retro';
  var md5 = crypto.createHash('md5').update(email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};
