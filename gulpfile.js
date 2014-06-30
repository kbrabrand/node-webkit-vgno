var gulp      = require('gulp'),
    NwBuilder = require('node-webkit-builder'),
    clean     = require('gulp-clean'),
    zip       = require('gulp-zip');


gulp.task('clean', function() {
    return gulp.src('./build', {read: false}).pipe(clean());
});

gulp.task('nw', function () {
    var nw = new NwBuilder({
        version: '0.9.2',
        files: [ './**']
    });

    // Log stuff you want
    nw.on('log', function (msg) {
        console.log('node-webkit-builder', msg);
    });

    // Build returns a promise, return it so the task isn't called in parallel
    return nw.build().catch(function (err) {
        console.log('node-webkit-builder', err);
    });
});