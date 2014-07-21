/**
 * Copyright: E2E Technologies Ltd
 */
'use strict';

var conf = require('./conf.js');

if( process.argv.length != 3) {
    console.log( 'Usage: node ' + process.argv[1] + ' <configuration path>' );
    process.exit(1);
}

conf.init(process.argv[2]);

process.stdin.setEncoding('utf8');

process.stdin.on('readable', function() {
    var chunk = process.stdin.read();
    if (chunk !== null) {
        console.log( chunk);
        conf.setObject( JSON.parse(chunk));
        conf.save(function () {
            process.exit();
        })
    }
});


