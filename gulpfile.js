var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


var app = express(),
    fs = require('fs'),
    gulp = require('gulp'),
    jade = require('gulp-jade'),
    stylus = require('gulp-stylus'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    babel = require('gulp-babel'),
    browserSync = require('browser-sync'),
    data = require('gulp-data'),
    watch = require('node-watch'),
    locals = {},
    defaultTasks = ['jade', 'stylus', 'js', 'locale', 'watch-all', 'browser-sync'];

var config = {
  root: './',
  src: './src/',
  build: __dirname + '/public/',
  language: 'en'
}

var merge = function(obj1, obj2){
  for(var attrname in obj2){
    obj1[attrname] = obj2[attrname]
  }
  return obj1
}


var paths = {
  build: config.build,
  static: config.build + 'assets/',
  css: config.build + 'assets/css/',
  js: config.build + 'assets/js/',
  srcJade: config.src + 'jade/pages/**/*.jade',
  srcStylus: config.src + 'stylus/app.styl',
  srcJs: [config.src + 'js/helpers/', config.src + 'js/'],
  styles: config.src + 'stylus/',
  jade: config.src + 'jade/',
  locale: config.src + 'locale/' + config.language + '.json'

}

var getLocals = function(){
  locals = merge({'config': config}, require(paths.locale));
  return merge({'paths': paths}, locals);
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
      // _locals = getLocals(),
      _root = config.root;
  
  gulp.src(paths.srcJade)
  .pipe(jade({
    locals: merge({_root: _root}, JSON.parse(fs.readFileSync(paths.locale))),

  }))
  .pipe(gulp.dest(paths.build));
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
  gulp.src(paths.srcJs)
  .pipe(babel({
    presets: ['es2015']
  }))
  .pipe(concat('app.js'))
  .pipe(gulp.dest(paths.js))
  .pipe(uglify())
  .pipe(rename('app.min.js'))
  .pipe(gulp.dest(paths.js));
})

gulp.task('locale', function(){
  watch(paths.locale, function(){
    gulp.start('jade');
  })
})
// watch all
gulp.task('watch-all', function(){
  watch(paths.jade, { recursive: true }, function(evt, file){
    gulp.start('jade');
  });

  watch(paths.styles, { recursive: true }, function(evt, file){
    gulp.start('stylus');
  });

  watch(config.src + 'js/', {recursive: true}, function(evt, file){
    console.log('watching js');
    gulp.start('js');
  })
});

gulp.task('default', defaultTasks ,function(){
  console.log('this is gulp defult task');
});

module.exports = app;
