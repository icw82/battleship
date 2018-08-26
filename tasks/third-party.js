const gulp = require('gulp');
const path = require('path');
const task_name = path.basename(__filename, '.js');
const settings = require('./../settings.js');

const parts = [];

// STYLES
{
    const part = {};
    parts.push(part);

    part.name = 'styles';
    part.paths = [
        'kenzo-kit/kk-reset.css'
    ].map(item => './node_modules/' + item);
}


parts.forEach(part => {
    part.task_name = task_name + ':' + part.name;

    gulp.task(part.task_name, () => gulp
        .src(part.paths)//, { allowEmpty: true}
        .pipe(gulp.dest(settings.dest + '/' + part.name + '/third-party'))
    );

    gulp.task('watch:' + part.task_name, () =>
        gulp.watch(part.paths, gulp.task(part.task_name))
    );
});

gulp.task(task_name, gulp.parallel(...parts.map(part => part.task_name)));
