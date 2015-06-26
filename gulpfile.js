var gulp = require('gulp');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var wrap = require('gulp-wrap');
var connect = require('gulp-connect');
var haml = require('gulp-ruby-haml');

gulp.task('styles', function() {
	var pre = 'source/css/';
	return gulp.src([pre + 'layout.scss',
					 pre + 'disco.scss',	
					 pre + 'content.scss',	
					 pre + 'display.scss',	
					 pre + 'work.scss',	
					 pre + 'work_display.scss',	
					 pre + 'nav.scss'])
			   .pipe(concat('main.css'))
			   .pipe(sass())
			   .pipe(gulp.dest('public/css'))
			   .pipe(connect.reload());
});

gulp.task('scripts', function() {
	return gulp.src(['source/js/matrix.js',
					'source/js/3d.js',	
					'source/js/script.js'])	
		   .pipe(jshint())
		   .pipe(plumber())
		   .pipe(concat('main.js'))
		   .pipe(gulp.dest('public/js'))
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
	return gulp.src(['public/index.html'])	
		   .pipe(connect.reload());
});

gulp.task('connect', function () {
connect.server({
		root: 'public',
		livereload: true	
	   });
});


gulp.task('watch', function() {
	gulp.watch(['source/css/*.scss'], ['styles']);	
	gulp.watch(['source/js/*.js', 'source/js/**/*'], ['scripts']);	
	gulp.watch(['public/index.html'], ['html']);
	gulp.watch(['source/haml/*'], ['haml']);
});

gulp.task('default', ['styles', 'scripts', 'haml', 'connect', 'watch']);
