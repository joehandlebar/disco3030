var gulp = require('gulp');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var wrap = require('gulp-wrap');
var connect = require('gulp-connect');
var haml = require('gulp-ruby-haml');
var include = require('gulp-file-include');
var rename = require('gulp-rename');

gulp.task('scripts', function() {
	var pre = 'source/js/'

	return gulp.src([pre + 'disco.js',	
					 pre + 'utils/*',	
					 pre + 'canvas/*.js',	
					 pre + 'components/*',
					 pre + 'router.js',	
					 pre + 'script.js'])	
		   //.pipe(jshint())
		   //.pipe(plumber())
		   .pipe(concat('main.js'))
		   .pipe(gulp.dest('public/js'))
		   .on('error', errorHandler)
		   .pipe(connect.reload())
		   .on('error', errorHandler);

		   function errorHandler(err) {
		   		console.log(err.toString());
		   		this.emit('end');
		   }
});

gulp.task('styles', function() {
	var pre = 'source/css/';

	return gulp.src([pre + 'layout.scss',
					 pre + 'disco.scss',	
					 pre + 'text.scss',	
					 pre + 'contact.scss',	
					 pre + 'content.scss',	
					 pre + 'display.scss',	
					 pre + 'resume.scss',	
					 pre + 'work.scss',	
					 pre + 'work_display.scss',	
					 pre + 'nav.scss'])
			   .pipe(concat('main.css'))
			   .pipe(sass())
			   .pipe(gulp.dest('public/css'))
			   .pipe(connect.reload());
});


gulp.task('haml', function() {
	return gulp.src('./source/haml/*.haml', {read: true})	
	//return gulp.src('source/haml/*.haml')	
		   .pipe(haml())
		   .pipe(gulp.dest('./public/view'))
		   .pipe(connect.reload());
});

gulp.task('html', function() {
	return gulp.src(['public/view/index_include.html'])	
		   .pipe(include({
		     prefix: '@@',
			 basepath: 'public/view/'
		   }))
		   .pipe(rename('index.html'))
		   .pipe(gulp.dest('public/'))
		   .pipe(connect.reload());
});

gulp.task('connect', function () {
connect.server({
		root: 'public',
		livereload: true	
	   });
});

gulp.task('watch', function() {
	gulp.watch(['source/css/*'], ['styles']);	
	gulp.watch(['source/js/*.js', 'source/js/**/*'], ['scripts']);	
	gulp.watch(['public/index.html', 'public/view/*'], ['html']);
	gulp.watch(['source/haml/*'], ['haml']);
});

gulp.task('default', ['html', 'styles', 'scripts', 'connect', 'watch']);
