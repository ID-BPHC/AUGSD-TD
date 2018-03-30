const os = require('os');
const prettify = require('gulp-jsbeautifier');
const eslint = require('gulp-eslint');
const nodemon = require('gulp-nodemon');
const spawn = require('child_process').spawn;
const mongodbData = require('gulp-mongodb-data');
const gulp = require('gulp-help')(require('gulp'));
const runSequence = require('run-sequence');
const minify = require('gulp-minifier');
const rename = require("gulp-rename");
const del = require('del');

// gulp.task('prettify', 'Prettify all server side js.', function () {
//     gulp.src(['./*.js', '!./gulpfile.js', './middleware/**/*.js', './public/**/*.js', './routes/**/*.js', './schemas/**/*.js', './*.js'], {
//             base: './'
//         })
//         .pipe(prettify())
//         .pipe(gulp.dest('./'));
// });

gulp.task('lint', 'Lints all server side js.', function () {
    gulp.src(['./*.js', './middleware/**/*.js', './routes/**/*.js', './schemas/**/*.js', './*.js'], {
            base: './'
        })
        .pipe(eslint());
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

gulp.task('install', 'Install packages using yarn.', function (cb) {
    var command = 'yarn';
    if (os.platform() === 'win32') {
        command = 'yarn.cmd';
    }
    var cmd = spawn(command, ['install'], {
        stdio: 'inherit'
    });
    cmd.on('close', function (code) {
        console.log('install exited with code ' + code);
        cb(code);
    });
});

gulp.task('run', 'Run node server.', function (cb) {
    var cmd = spawn('node', ['./bin/www'], {
        stdio: 'inherit'
    });
    cmd.on('close', function (code) {
        console.log('run exited with code ' + code);
        cb(code);
    });
    cmd.on('error', function (err) {
        console.error(err);
        process.exit(1);
    });
    cmd.on('exit', function (code) {
        if (code !== 0) {
            console.log('Bower failed.');
        }
    });
});

// gulp.task('minify', 'Minifies all javascript files in public.', function () {
//     return gulp.src('public/**/*').pipe(minify({
//         minify: true,
//         collapseWhitespace: true,
//         conservativeCollapse: true,
//         minifyJS: true,
//         minifyCSS: true,
//         getKeptComment: function (content, filePath) {
//             var m = content.match(/\/\*![\s\S]*?\*\//img);
//             return m && m.join('\n') + '\n' || '';
//         }
//     })).pipe(gulp.dest('public/'));
// });

gulp.task('check', 'Prettifying and checks linting.', function () {
    runSequence('install', 'lint', 'run');
});

gulp.task('switch-to-pug','Switches jade files to pug.', function() {
    console.log('\nCreated:\n');
    gulp.src(['./views/**/*.jade'])
        .pipe(rename(function(path){
            path.extname = ".pug";
            console.log(path.dirname+'/'+path.basename + path.extname+'\n');
        }))
        .pipe(gulp.dest('./views/'))
        .on('end', function(){
            del(['./views/**/*.jade'], { force: true }).then(function(paths){
                console.log('\nDeleted:\n\n', paths.join('\n'));
            });
        });
});