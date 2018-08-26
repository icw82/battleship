const gulp = require('gulp');
const browserSync = require('browser-sync').create();

class Task {
    constructor(name, settings) {
        this.name = name;
        this.settings = settings;
        this.parts = [];
    }

    has (name) {
        return this.parts.find(item => item.name === name);
    }

    add (name) {
        let part = this.has(name);

        if (part)
            return;

        part = new TaskPart(name, this);
        this.parts.push(part);
        return part;
    }

    init() {
        this.parts.forEach(part => part.init());
        const part_names = this.parts.map(part => part.full_name);
        gulp.task(this.name, gulp.parallel(...part_names));
    }
}

class TaskPart {
    constructor(name, task) {
        this.name = name;
        this.task = task;
        this.full_name = `${ this.task.name }:${ this.name }`; // task_name
        this.settings = task.settings;

        this.paths = [];
        this.wrapper = ['', ''];
        this.item_wrapper = ['', ''];
    }

    init() {
        gulp.task(this.full_name, this.task.sequence.bind(this, null));

        gulp.task(`watch:${ this.full_name }`, () => {
    //        browserSync.init({
    //            server: "./sources"
    //        });

            gulp.watch(this.paths, gulp.task(this.full_name))
    //            .on('change', browserSync.reload)
        });
    }

}

module.exports = {Task, TaskPart}
