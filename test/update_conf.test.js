/**
 * Copyright: E2E Technologies Ltd
 */
'use strict';

var fs = require('fs-extra'),
    path = require('path'),
    child_process = require('child_process');

exports.testNoLocalConf = {
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

        update = child_process.spawn(process.execPath, [path.resolve(__dirname, '../cli.js'), "-u"]);

        update.on('close', function (code) {
            test.equals(1, code);
            test.done();
        });
    },

    testWrongFlag: function (test) {
        var update;

        test.expect(1);

        update = child_process.spawn(process.execPath, [path.resolve(__dirname, '../cli.js'), "-wrong", "dir/"]);

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

        update.stderr.on('data', function (chunk) {
            output += chunk.toString();
        });

        update.stdin.end('no JSON');
    }


};

exports.testLocalConf = {
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

    testUpdateChangedProperty: function (test) {
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
                    connection: {user: 'changed', passwd: 'changed'},
                    performance: {}
                }
            );

            test.done();
        });

        update.stdin.end(
            '{ "connection": {"user": "changed", "passwd": "changed"}, ' +
            '"performance": {"truncateArrays": 100}, ' +
            '"NODE_ENV": "production"}');
    },

    testUpdateNewProperty: function (test) {
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
                    connection: {user: 'local', passwd: 'local'},
                    somethingnew: 1,
                    performance: {}
                }
            );

            test.done();
        });

        update.stdin.end(
            '{ "somethingnew": 1, ' +
            '"connection": { "user": "local", "passwd": "local" }, ' +
            '"performance": {"truncateArrays": 100}, ' +
            '"NODE_ENV": "production"}');
    },

    testUpdateInvalidJSON: function (test) {
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
            test.deepEqual(fs.readJsonFileSync(conf.localFile()),
                {
                    connection: {user: 'local', passwd: 'local'},
                    local: 1
                }
            );
            test.done();
        });

        update.stderr.on('data', function (chunk) {
            output += chunk.toString();
        });

        update.stdin.end('no JSON');
    }
};


process.on('uncaughtException', function (err) {
    console.error(err.stack);
});
