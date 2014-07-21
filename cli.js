/**
 * Copyright: E2E Technologies Ltd
 */
'use strict';

var conf = require('./conf.js'),
    configurationPath,
    isRead;

if( process.argv.length < 3
    || process.argv.length > 4
    || process.argv.length === 4 && process.argv[2] !== '-u'
    || process.argv.length === 3 && process.argv[2] === '-u') {
    console.log( 'Usage: node ' + process.argv[1] + ' [-u] <configuration path>\n\n' +
                 '-u: Update configuration. Configuration is read from stdin.\n' +
                 'Default is to display the configuration at stdout.');
    process.exit(1);
}

isRead = process.argv.length === 3;
configurationPath = isRead ? process.argv[2] : process.argv[3];

conf.initOnlyFiles(configurationPath);

if( isRead) {
    var value = conf.get();
    process.stdout.write(JSON.stringify(value, null, 2));
    process.exit();
} else {
    process.stdin.setEncoding('utf8');

    process.stdin.on('readable', function() {
        var chunk = process.stdin.read();
        if (chunk !== null) {
            try {
                conf.setObject( JSON.parse(chunk));
            } catch (e) {
                if(e instanceof SyntaxError) {
                    process.stderr.write('Invalid JSON: ');
                    process.stderr.write(e.message);
                    process.exit(1);
                } else {
                    process.stderr.write(e);
                    process.exit(2);
                }
            }
            conf.save(function () {
                process.exit();
            })
        }
    });
}

