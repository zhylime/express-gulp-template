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
    stylus = require('gulp-stylus'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    browserSync = require('browser-sync'),
    watch = require('node-watch'),
    defaultTasks = ['jade', 'stylus', 'js', 'watch-all', 'browser-sync'];

 
var config = {
  root: './',
  src: './src/',
  build: __dirname + '/public/'
}

var paths = {
  build: config.build,

  static: config.build + 'assets/',
  css: config.build + 'assets/css/',
  js: config.build + 'assets/js/',
  srcJade: config.src + 'jade/pages/**/*.jade',
  srcStylus: config.src + 'stylus/app.styl',
  srcJs: config.src + 'js/',
  styles: config.src + 'stylus/',
  jade: config.src + 'jade/',

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
  var _build = paths.build,
      _root = config.root;
  gulp.src(paths.srcJade)
  .pipe(jade({
    locals: {_root: _root},
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

// stylus task
gulp.task('stylus', function(){
  gulp.src(paths.srcStylus)
  .pipe(stylus())
  .pipe(gulp.dest(paths.css));
})

gulp.task('js', function(){
  gulp.src(paths.srcJs + '*.js')
  .pipe(concat('app.js'))
  .pipe(gulp.dest(paths.js))
  .pipe(uglify())
  .pipe(rename('app.min.js'))
  .pipe(gulp.dest(paths.js));
})

// watch all
gulp.task('watch-all', function(){
  watch(paths.jade, { recursive: true }, function(evt, file){
    gulp.start('jade');
  });

  watch(paths.styles, { recursive: true }, function(evt, file){
    gulp.start('stylus');
  })
});

gulp.task('default', defaultTasks ,function(){
  console.log('this is gulp defult task');
});

module.exports = app;
