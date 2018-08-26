'use strict';

const gulp = require('gulp');
const path = require('path');
const task_name = path.basename(__filename, '.js');
const settings = require('./../settings.js');

const task = done => {
    gulp.series(
        'clean',
        'immutable',
        gulp.parallel(
            'third-party',
            'scripts',
            'styles',
            'images'
        ),
        'watch'
    )(done);
};

gulp.task(task_name, task);
