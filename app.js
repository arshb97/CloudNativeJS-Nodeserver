var zipkin = require('appmetrics-zipkin')({
  host: 'localhost',
  port: 9411,
  serviceName: "nodeserver"
});
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let health = require('@cloudnative/health-connect')
var prom = require('appmetrics-prometheus').attach()    //attach to express server. uses localhose:3000/metrics

let healthcheck = new health.HealthChecker()
let pingcheck1 = new health.PingCheck("example.com")
let pingcheck2 = new health.PingCheck("example.com")

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// producing a liveness and readiness end point 
app.use('/live', health.LivenessEndpoint(healthcheck))
app.use('/ready', health.ReadinessEndpoint(healthcheck))
healthcheck.registerLivenessCheck(pingcheck1)
healthcheck.registerReadinessCheck(pingcheck2)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

module.exports = app;
