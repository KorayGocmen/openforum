var express         = require('express');
var path            = require('path');
var favicon         = require('serve-favicon');
var logger          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var Sequelize       = require('sequelize');
var db              = require('sequelize-connect');
var chalk           = require('chalk');
var secrets         = require('./secrets');

// Route Requirements
var routes_controller    = require('./routes/index_controller');
var users_controller     = require('./routes/user_controller');
var message_controller   = require('./routes/message_controller');
var channel_controller   = require('./routes/channel_controller');

// Database sequelize
var connectionString;
var username;
var password;
var database;
if (process.env.NODE_ENV === 'production'){
    connectionString = global.productionConnectionString;
    database = global.nameDatabase_production;
    username = global.usernameDatabase_production;
    password = global.passwordDatabase_production;
}else{
    connectionString = global.localConnectionString;
    database = global.nameDatabase_development;
    username = global.usernameDatabase_development;
    password = global.passwordDatabase_development;
}
try {
    var sequelize = new Sequelize(connectionString);
}catch(err){
    console.log(err);
}
// Model ORM configurations
var discover = path.join(__dirname, 'models');
var matcher = function (file) {
    return true;
}

var orm = new db(
    database,
    username,
    password,
    {
        dialect: 'postgres',
        port: 5432,
        force: false
    },
    discover,
    matcher
);

// Check the connection to the database
sequelize.authenticate().then(function () {
    console.log("Environment: ", process.env.NODE_ENV);
    console.log(chalk.green("Connection to database successfull"));
}).catch(function () {
    console.log("Environment: ", process.env.NODE_ENV);
    console.log(chalk.red("Unable to connect to the database"));
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Controller Routes
app.use('/', routes_controller);
app.use('/users', users_controller);
app.use('/messages', message_controller);
app.use('/channels', channel_controller);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
