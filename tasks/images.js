'use strict';

const gulp = require('gulp');
const path = require('path');
const task_name = path.basename(__filename, '.js');
const settings = require('./../settings.js');

const rename = require('gulp-rename');

const parts = [];

// MAIN
{
    const part = {};
    parts.push(part);

    part.name = 'main';
    part.paths = [
        'base/images/*.*',
        'components/*/images/*.*'
    ].map(item => './sources/' + item);
}

parts.forEach(part => {
    part.task_name = task_name + ':' + part.name;

    gulp.task(part.task_name, () => gulp
        .src(part.paths)//, { allowEmpty: true}
        .pipe(rename(item => {
            item.dirname = path.join(item.dirname, '..');
        }))
        .pipe(gulp.dest(settings.dest + '/images'))
    );

    gulp.task('watch:' + part.task_name, () =>
        gulp.watch(part.paths, gulp.task(part.task_name))
    );
});

gulp.task(task_name, gulp.parallel(...parts.map(part => part.task_name)));
