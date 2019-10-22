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
        fs.removeSync(this.basePath);

        callback();
    },

    testMissingDirectoryParameter: function (test) {
        var update;

        test.expect(1);

        update = child_process.spawn(process.execPath, [path.resolve(__dirname, '../cli.js'), "-u"]);

        update.on('close', function (code) {
            test.equals(code, 2);
            test.done();
        });
    },

    testWrongFlag: function (test) {
        var update;

        test.expect(1);

        update = child_process.spawn(process.execPath, [path.resolve(__dirname, '../cli.js'), "-wrong", "dir/"]);

        update.on('close', function (code) {
            test.equals(code, 2);
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
            '-u', 'test/hello.json',
            this.basePath
        ]);

        update.on('close', function (code) {
            test.equals(code, 0);

            conf.init(self.basePath);
            test.deepEqual(fs.readJsonSync(conf.localFile()),
                {
                    hello: 'changed'
                });

            test.done();
        });
    },

    testInvalidJSON: function (test) {
        var conf = this.conf,
            self = this,
            update,
            output = '';

        test.expect(3);

        update = child_process.spawn(process.execPath, [
            path.resolve(__dirname, '../cli.js'),
            '-u', 'test/invalid.json',
            this.basePath
        ]);

        update.on('close', function (code) {
            test.equals(1, code);
            test.notEqual(output.search(/Unexpected token o in JSON at position 1/), -1);

            conf.init(self.basePath);
            fs.stat(conf.localFile(), function (err) {
                test.equals(err.code, "ENOENT");
                test.done();
            });
        });

        update.stderr.on('data', function (chunk) {
            output += chunk.toString();
        });
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
        fs.removeSync(this.basePath);

        callback();
    },

    testUpdateChangedProperty: function (test) {
        var conf = this.conf,
            self = this,
            update;

        test.expect(2);

        update = child_process.spawn(process.execPath, [
            path.resolve(__dirname, '../cli.js'),
            '-u', 'test/updateChanged.json',
            this.basePath
        ]);

        update.on('close', function (code) {
            test.equals(code, 0);

            conf.init(self.basePath);
            test.deepEqual(fs.readJsonSync(conf.localFile()),
                {
                    connection: {user: 'changed', passwd: 'changed'}
                }
            );

            test.done();
        });
    },

    testUpdateNewProperty: function (test) {
        var conf = this.conf,
            self = this,
            update;

        test.expect(2);

        update = child_process.spawn(process.execPath, [
            path.resolve(__dirname, '../cli.js'),
            '-u', 'test/updateNew.json',
            this.basePath
        ]);

        update.on('close', function (code) {
            test.equals(0, code);

            conf.init(self.basePath);
            test.deepEqual(fs.readJsonSync(conf.localFile()),
                {
                    connection: {user: 'local', passwd: 'local'},
                    somethingnew: 1
                }
            );

            test.done();
        });
    },

    testUpdateInvalidJSON: function (test) {
        var conf = this.conf,
            self = this,
            update,
            output = '';

        test.expect(3);

        update = child_process.spawn(process.execPath, [
            path.resolve(__dirname, '../cli.js'),
            '-u', 'test/invalid.json',
            this.basePath
        ]);

        update.on('close', function (code) {
            test.equals(code, 1);
            test.notEqual(output.search(/Unexpected token o in JSON at position 1/), -1);

            conf.init(self.basePath);
            test.deepEqual(fs.readJsonSync(conf.localFile()),
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
    }
};


process.on('uncaughtException', function (err) {
    console.error(err.stack);
});
