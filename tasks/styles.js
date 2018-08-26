const gulp = require('gulp');
const path = require('path');

const { Task, TaskPart } = require('./../tools/Task');
const variables = require('./../tools/variables');

const settings = require('./../settings.js');

const task = new Task(
    path.basename(__filename, '.js'),
    settings
);

const concat = require('gulp-concat');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const mixins = require('postcss-mixins');
const cssvariables  = require('postcss-css-variables');
const color_functions = require('postcss-color-function');
const autoprefixer = require('autoprefixer');
const csso = require('gulp-csso');
const strip = require('gulp-strip-comments');


// MAIN
{
    const part = task.add('main');
    part.paths.push('./sources/base/styles/vars.css');
    part.paths.push('./sources/base/styles/mixins.css');
    part.paths.push('./sources/base/styles/base.css');
}


task.sequence = function() {
    const self = this

    let sequence = gulp
        .src(self.paths)
        .pipe(variables(settings));

    sequence = sequence
        .pipe(concat(self.name + '.css'))
        .pipe(postcss([
            mixins(),
            cssvariables(),
            color_functions(),
        ]))
        .pipe(strip.text())
//        .pipe(rename({suffix: '.min'}))
//        .pipe(csso().on('error', gutil.log))
        .pipe(gulp.dest(self.settings.dest + '/styles'))

    return sequence;

}

task.init();
