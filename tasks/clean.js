'use strict';

const gulp = require('gulp');
const path = require('path');
const task_name = path.basename(__filename, '.js');
const settings = require('./../settings.js');

const del = require('del');

const task = done => del([
    settings.dest + '**/*'
], {force: true}, done);

gulp.task(task_name, task);
