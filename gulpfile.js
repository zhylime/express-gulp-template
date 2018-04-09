var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


var app = express(),
    gulp = require('gulp'),
    jade = require('gulp-jade'),
    browserSync = require('browser-sync'),
    defaultTasks = ['jade', 'browser-sync'];

 
var config = {
  root: './',
  src: './src/',
  build: __dirname + '/build/'
}

var paths = {
  build: config.build,
  static: config.build + 'assets/',
  srcJade: config.src + 'jade/pages/**/*.jade'
}
// view engine setup
app.set('views', path.join(__dirname, 'src'));
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

// jade task
gulp.task('jade', function(){
  gulp.src(paths.srcJade)
  .pipe(jade({
    pretty:true
  }))
  .pipe(gulp.dest(paths.build));
  console.log('compiled jade successfully!');
})

// browser-sync task
gulp.task('browser-sync', function(){
  browserSync.init({
    server:{
      baseDir: paths.build
    }
  })
});

gulp.task('default', defaultTasks ,function(){
  console.log('this is gulp defult task');
})

module.exports = app;
