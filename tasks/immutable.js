'use strict';

const gulp = require('gulp');
const path = require('path');
const task_name = path.basename(__filename, '.js');
const settings = require('./../settings.js');

const replace = require('gulp-replace');

const glob = [
    './sources/immutable/**/*.*'
];

const task = () => gulp
    .src(glob)
    .pipe(replace(/::version::/g, settings.version, {skipBinary: true}))
    .pipe(gulp.dest(settings.dest)
);

gulp.task(task_name, task);

gulp.task('watch:' + task_name, () => gulp.watch(glob, gulp.task(task_name)));
