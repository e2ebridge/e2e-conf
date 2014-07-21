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

    testMissingDirectoryParameter: function (test) {
        var update;

        test.expect(1);

        update = child_process.spawn(process.execPath, [ path.resolve(__dirname, '../cli.js'), "-u"]);

        update.on('close', function (code) {
            test.equals(1, code);
            test.done();
        });
    },

    testWrongFlag: function (test) {
        var update;

        test.expect(1);

        update = child_process.spawn(process.execPath, [ path.resolve(__dirname, '../cli.js'), "-wrong", "dir/"]);

        update.on('close', function (code) {
            test.equals(1, code);
            test.done();
        });
    },

    testUpdate: function (test) {
        var conf = this.conf,
            self = this,
            update;

        test.expect(2);

        update = child_process.spawn(process.execPath, [
            path.resolve(__dirname, '../cli.js'),
            "-u",
            this.basePath
        ]);

        update.on('close', function (code) {
            test.equals(0, code);

            conf.init(self.basePath);
            test.deepEqual(fs.readJsonFileSync(conf.localFile()),
                {
                    hello: 'changed'
                });

            test.done();
        });

        update.stdin.end('{"hello":"changed"}');
    },

    testInvalidJSON: function (test) {
        var conf = this.conf,
            self = this,
            update,
            output = '';

        test.expect(3);

        update = child_process.spawn(process.execPath, [
            path.resolve(__dirname, '../cli.js'),
            "-u",
            this.basePath
        ]);

        update.on('close', function (code) {
            test.equals(1, code);
            test.equals('Invalid JSON: Unexpected token o', output);

            conf.init(self.basePath);
            fs.stat(conf.localFile(), function (err) {
                test.equals(err.code, "ENOENT");
                test.done();
            });
        });

        update.stderr.on('data', function(chunk){
            output += chunk.toString();
        });

        update.stdin.end('no JSON');
    }




};

exports.testConf2 = {
    setUp: function (callback) {
        var defaultPath;
        this.basePath = './tmp';
        defaultPath = this.basePath + '/config/default';
        fs.ensureDirSync(defaultPath);
        fs.copySync(path.resolve(__dirname, 'complex/config/default/config.json'), defaultPath + '/config.json');
        fs.copySync(path.resolve(__dirname, 'complex/config/local/config.json'), this.basePath + '/config/local/config.json');
        this.conf = require('../conf.js');

        callback();
    },

    tearDown: function (callback) {
        this.conf.cleanUp();
        fs.deleteSync(this.basePath);

        callback();
    },

    testUpdate: function (test) {
        var conf = this.conf,
            self = this,
            update;

        test.expect(2);

        update = child_process.spawn(process.execPath, [
            path.resolve(__dirname, '../update_conf.js'),
            this.basePath
        ]);

        update.on('close', function (code) {
            test.equals(0, code);

            conf.init(self.basePath);
            test.deepEqual(fs.readJsonFileSync(conf.localFile()),
                {
                    connection: { user: 'ttt', passwd: 'ee', client: 'ee', ashost: 'eee' },
                    pool: {},
                    performance: {}
                }
            );

            test.done();
        });

        update.stdin.end('{\n  "connection": {\n    "sysid": "",\n    "sysnr": "",\n    "user": "ttt",\n    "passwd": "ee",\n    "client": "ee",\n    "ashost": "eee",\n    "lang": ""\n  },\n  "pool": {\n    "maxCount": 5,\n    "maxIdle": 300\n  },\n  "performance": {\n    "truncateArrays": 100\n  },\n  "debug": false,\n  "pageSize": 25,\n  "PORT": 3000,\n  "NODE_ENV": "production"\n}\n');
    }

};


process.on('uncaughtException', function (err) {
    console.error(err.stack);
});
