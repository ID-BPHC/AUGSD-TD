var gulp = require('gulp');
var prettify = require('gulp-jsbeautifier');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');

gulp.task('prettify', function () {
    gulp.src(['./*.js', '!./gulpfile.js', './middleware/**/*.js', './public/**/*.js', './routes/**/*.js', './schemas/**/*.js', './*.js'], {
            base: './'
        })
        .pipe(prettify())
        .pipe(gulp.dest('./'));
});

gulp.task('lint', function () {
    gulp.src(['./*.js', './middleware/**/*.js', './routes/**/*.js', './schemas/**/*.js', './*.js'], {
            base: './'
        })
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});