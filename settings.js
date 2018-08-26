'use strict';

const fs = require('fs');

const settings = {};
const info = require('./package.json');

settings.name =  info.name;
settings.version = info.version;

settings.dest = 'build';

module.exports = settings;
