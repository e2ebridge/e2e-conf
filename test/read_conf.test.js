/**
 * Copyright: E2E Technologies Ltd
 */
'use strict';

var fs = require('fs-extra'),
    path = require('path'),
    child_process = require('child_process');

exports.testConf = {
    setUp: function (callback) {
        var defaultPath;
        this.basePath = './tmp';
        defaultPath = this.basePath + '/config/default';
        fs.ensureDirSync(defaultPath);
        fs.copySync(path.resolve(__dirname, 'config/default/config.json'), defaultPath + '/config.json');
        this.conf = require('../conf.js');

        callback();
    },

    tearDown: function (callback) {
        this.conf.cleanUp();
        fs.deleteSync(this.basePath);

        callback();
    },

    testMissingParameter: function (test) {
        var subprocess;

        test.expect(1);

        subprocess = child_process.spawn(process.execPath, [path.resolve(__dirname, '../cli.js')]);

        subprocess.on('close', function (code) {
            test.equals(code, 2);
            test.done();
        });
    },

    testRead: function (test) {
        var subprocess;

        test.expect(2);

        subprocess = child_process.spawn(process.execPath, [
            path.resolve(__dirname, '../cli.js'),
            this.basePath
        ]);

        subprocess.stdout.setEncoding('utf8');

        subprocess.stdout.on('data', function (chunk) {
            test.equals("{\n  \"hello\": \"world\",\n  \"sub\": {\n    \"a\": \"default\",\n    \"b\": \"default\"\n  },\n  \"many\": [\n    1,\n    2,\n    3\n  ]\n}", chunk);
        });

        subprocess.on('close', function (code) {
            test.equals(code, 0);
            test.done();
        });
    }

};

process.on('uncaughtException', function (err) {
    console.error(err.stack);
});
