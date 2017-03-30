#!/usr/bin/env node
const gulp = require('gulp');
const gutil = require('gulp-util');
const chalk = require('chalk');
const prettyTime = require('pretty-hrtime');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const through = require('through2');
const path = require('path');

const args = process.argv.splice(2);
const srcPath = args[0];
const targetFile = args[1];
const type = args[2] || 'default';

function formatError (e) {
    if (!e.err) {
        return e.message;
    }

    // PluginError
    if (typeof e.err.showStack === 'boolean') {
        return e.err.toString();
    }

    // Normal error
    if (e.err.stack) {
        return e.err.stack;
    }

    // Unknown (string, number, etc.)
    return new Error(String(e.err)).stack;
}

gulp.on('task_start', function (e) {
    gutil.log('Starting', '\'' + chalk.cyan(e.task) + '\'...');
});

gulp.on('task_stop', function (e) {
    const time = prettyTime(e.hrDuration);
    gutil.log(
        'Finished', '\'' + chalk.cyan(e.task) + '\'',
        'after', chalk.magenta(time)
    );
});

gulp.on('task_err', function (e) {
    const msg = formatError(e);
    const time = prettyTime(e.hrDuration);
    gutil.log(
        '\'' + chalk.cyan(e.task) + '\'',
        chalk.red('errored after'),
        chalk.magenta(time)
    );
    gutil.log(msg);
});

gulp.on('task_not_found', function (err) {
    gutil.log(
        chalk.red('Task \'' + err.task + '\' is not in your gulpfile')
    );
    gutil.log('Please check the documentation for proper gulpfile formatting');
    process.exit(1);
});

gulp.task('default', function () {
    const filename = path.basename(targetFile);
    const destPath = path.dirname(targetFile);
    return gulp.src([
        srcPath + '/**/*.js',
    ])
    .pipe(concat(filename))
    .pipe(uglify({ compress: { drop_console: true } }))
    .pipe(through.obj((file, encoding, callback) => { file.contents = new Buffer('module.exports=(res, params)=>{' + String(file.contents) + '}'); callback(null, file); }))
    .pipe(gulp.dest(destPath));
});

gulp.task('dev', ['default'], function () {
    gulp.watch([srcPath + '/**/*.js'], ['default']);
});

gulp.start(type);
