'use strict';

const path = require('path');
const through = require('through2');

module.exports = settings => {
    return through.obj( (file, enc, callback) => {
        const filepath = path.parse(file.path);

        // Только для текстовых файлов же
        let string = String(file.contents);

        string = string.replace(/::appname::/g, settings.name);
        string = string.replace(/::version::/g, settings.version);

        if ([
            'component',
            'styles',
            'template'
        ].includes(filepath.name)) {
            const name = path.basename(filepath.dir);

            switch (filepath.name) {
                case `styles`:
                    string = string.replace(/NAME/g, name);
                    break;

                case `template`:
                    string = string.replace(/@name/g, name);
                    break;

                default:
                    string = string.replace(/::name::/g, name);
                    break;
            }
        }

        file.contents = Buffer.from(string);
        callback(null, file);
    });
};
