/**
 * Copyright: E2E Technologies Ltd
 */
'use strict';

var conf = require('./conf.js'),
    exit = require('exit'),
    configurationPath,
    isRead;

if (process.argv.length < 3
    || process.argv.length > 4
    || process.argv.length === 4 && process.argv[2] !== '-u'
    || process.argv.length === 3 && process.argv[2] === '-u') {
    console.log(
        'Usage: node ' + process.argv[1] + ' [-u] <configuration path>\n\n' +
        '-u: Update configuration. Configuration is read from stdin.\n' +
        'Default is to display the configuration at stdout.');
    exit(1);
}

isRead = process.argv.length === 3;
configurationPath = isRead ? process.argv[2] : process.argv[3];

conf.initOnlyFiles(configurationPath);

if (isRead) {
    var value = conf.get();
    process.stdout.write(JSON.stringify(value, null, 2));
    exit(0);
} else {
    process.stdin.setEncoding('utf8');

    process.stdin.on('readable', function () {
        var chunk = process.stdin.read();
        var actualConfig;
        if (chunk !== null) {
            try {
                actualConfig = JSON.parse(chunk);
            } catch (e) {
                if (e instanceof SyntaxError) {
                    process.stderr.write('Invalid JSON: ');
                    process.stderr.write(e.message);
                    exit(1);
                } else {
                    process.stderr.write(e);
                    exit(2);
                }
            }
            conf.save(actualConfig, function () {
                exit();
            })
        }
    });
}

