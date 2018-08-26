const is = require('./tools/is');

if (
    !is.dir('./sources') ||
    !is.dir('./sources/base') ||
    !is.dir('./sources/immutable')
) {
    throw Error(
        ['\x1b[31m', '\x1b[0m'].join('%s'),
        path + ' — не существует'
    );
}

const tasks_dir = './tasks/';
const fs = require('fs');
const tasks = fs.readdirSync(tasks_dir);

tasks.forEach(task => {
    const path = tasks_dir + '/' + task;
    if (is.file(path))
        require(path);
});
