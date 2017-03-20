#!/usr/bin/env node
var gulp = require('gulp');
var gutil = require('gulp-util');
var chalk = require('chalk');
var prettyTime = require('pretty-hrtime');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var through = require('through2');
var path = require('path');

var args = process.argv.splice(2);
var srcPath = args[0];
var targetFile = args[1];
var type = args[2] || 'default';

gulp.on('task_start', function(e) {
    gutil.log('Starting', '\'' + chalk.cyan(e.task) + '\'...');
});

gulp.on('task_stop', function(e) {
    var time = prettyTime(e.hrDuration);
    gutil.log(
        'Finished', '\'' + chalk.cyan(e.task) + '\'',
        'after', chalk.magenta(time)
    );
});

gulp.on('task_err', function(e) {
    var msg = formatError(e);
    var time = prettyTime(e.hrDuration);
    gutil.log(
        '\'' + chalk.cyan(e.task) + '\'',
        chalk.red('errored after'),
        chalk.magenta(time)
    );
    gutil.log(msg);
});

gulp.on('task_not_found', function(err) {
    gutil.log(
        chalk.red('Task \'' + err.task + '\' is not in your gulpfile')
    );
    gutil.log('Please check the documentation for proper gulpfile formatting');
    process.exit(1);
});

gulp.task('default', function() {
    var filename = path.basename(targetFile);
    var destPath = path.dirname(targetFile);
    return gulp.src([
        srcPath+'/**/*.js',
    ])
    .pipe(concat(filename))
    .pipe(uglify({compress: {drop_console: true}}))
    .pipe(through.obj((file, encoding, callback)=>{file.contents = new Buffer('module.exports=(res, params)=>{'+String(file.contents)+ '}'); callback(null, file);}))
    .pipe(gulp.dest(destPath));
});

gulp.task('dev', ['default'], function() {
    gulp.watch([srcPath+'/**/*.js'], ['default']);
});

gulp.start(type);
