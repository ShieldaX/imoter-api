const createError = require('http-errors');
const express = require('express');
const path = require('path');
// const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/error-handler');
const logger = require('morgan');
// const passport = require('passport');
const jwt = require('jsonwebtoken');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
// const authRouter = require('./routes/auth');

// Datebase
const db = require('./models/db');

const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// app.use(passport.initialize());
//initializes the passport configuration.
// require('./passport-config')(passport);
//imports our configuration file which holds our verification callbacks and things like the secret for signing.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
    jwt.verify(req.headers.authorization.split(' ')[1], 'RESTFULAPIs', function(err, decode) {
      if (err) req.user = undefined;
      req.user = decode;
      next();
    });
  } else {
    req.user = undefined;
    next();
  }
});

app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/api', apiRouter);
// app.use('/auth', passport.authenticate('jwt', {session: false}), authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(errorHandler);

module.exports = app;
