var del = require('del');
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');

//THE FUCK IS THIS? THE FUCK IS THAT? ERROR CAN'T WRITE STREAM. 50 FUCKING ISSUES LATER ON GITHUB AND I'M NO GODDAMNED CLOSER TO A FAIRLY FUCKING SIMPLE BUNDLE. FUCK THIS NOISE, FUCK YOUR WONTFIX. THIS IS THE DEATH OF CODE.
//FIXME

var paths = {
  scripts: 'js/*.js',
  browserify: "index.js"
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use any package available on npm
gulp.task('clean', function() {
  // You can use multiple globbing patterns as you would with `gulp.src`
  return del(['build']);
});

gulp.task('js', ['clean'], function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.scripts)
    .pipe(source(browserify('./index.js').bundle()))
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .pipe(concat('all.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./build/'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['js']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'js']);
