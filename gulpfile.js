var gulp = require('gulp');
var prettify = require('gulp-jsbeautifier');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');
var exec = require('child_process').exec;
var mongodbData = require('gulp-mongodb-data');
var gulp = require('gulp-help')(require('gulp'));
var runSequence = require('run-sequence');
var gulp = require('gulp-npm-run')(require('gulp-help')(require('gulp')));

function runCommand(command) {
    return function (cb) {
        exec(command, function (err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            cb(err);
        });
    };
}

gulp.task('prettify', 'Prettify all server side js.', function () {
    gulp.src(['./*.js', '!./gulpfile.js', './middleware/**/*.js', './public/**/*.js', './routes/**/*.js', './schemas/**/*.js', './*.js'], {
            base: './'
        })
        .pipe(prettify())
        .pipe(gulp.dest('./'));
});

gulp.task('lint', 'Lints all server side js.', function () {
    gulp.src(['./*.js', './middleware/**/*.js', './routes/**/*.js', './schemas/**/*.js', './*.js'], {
            base: './'
        })
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('metadata', 'Imports default portals definitions.', function () {
    console.log("Importing Collections");
    gulp.src('./metadata/portals.json')
        .pipe(mongodbData({
            mongoUrl: 'mongodb://localhost/ID-dev',
            collectionName: 'portals',
            dropCollection: true
        }));
});

gulp.task('start', 'Runs npm server.', function () {
    runCommand('npm start');
});

gulp.task('check', 'Prettifying and checks linting.', function () {
    runSequence('prettify', 'lint');
});