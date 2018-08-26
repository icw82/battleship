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
const insert = require('gulp-insert');
const babel = require('gulp-babel');
const minify = require('gulp-babel-minify');
const rename = require('gulp-rename');
const replace = require('gulp-replace');

// A P P
{
    const part = task.add('main');
    part.paths.push('./sources/base/scripts/utils.js');

    part.paths.push('./sources/base/scripts/classes/*.js');

    part.paths.push('./sources/base/scripts/app.js');

}

task.sequence = function() {
    const self = this

    let sequence = gulp
        .src(self.paths);

    sequence = sequence
        .pipe(insert.wrap(...self.item_wrapper))
        .pipe(variables(settings))
        .pipe(concat(self.name + `.js`))
        .pipe(insert.wrap(...self.wrapper))
        .pipe(gulp.dest(self.settings.dest + `/scripts`))
        .pipe(rename({suffix: '.es5'}))
        .pipe(babel({
            presets: [`@babel/preset-env`],
        }))
        .pipe(gulp.dest(self.settings.dest + `/scripts`))
//        .pipe(minify({
//            mangle: {
//                keepClassName: true
//            }
//        }))
//        .pipe(rename({suffix: '.min'}))
//        .pipe(gulp.dest(self.settings.dest + '/scripts'))

    return sequence;

}

task.init();
