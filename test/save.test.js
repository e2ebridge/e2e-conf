/**
 * Copyright: E2E Technologies Ltd
 */
'use strict';

var fs = require('fs-extra'),
    path = require('path');

exports.testConf = {
    setUp: function (callback) {
        var defaultPath;
        this.basePath = './tmp';
        this.localConfig = this.basePath + '/config/local/config.json';
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

    testChangePropertyAndRollback: function (test) {
        var conf = this.conf,
            self = this;

        test.expect(8);

        conf.init(this.basePath);
        test.equals(conf.get('hello'), 'world');

        test.equals(true, conf.set('hello', 'changed'));
        test.equals(conf.get('hello'), 'changed');
        conf.save(function (err) {
            test.ifError(err);

            test.deepEqual(fs.readJsonFileSync(conf.localFile()),
                {
                    hello: 'changed'
                });

            // rollback the changes
            test.equals(true, conf.set('hello', 'world'));

            conf.save(function (err) {
                var resolve = path.resolve(self.localConfig);
                test.ifError(err);

                test.deepEqual(fs.existsSync(resolve), false);

                test.done();
            });
        });

    },

    testChangeObject: function (test) {
        var conf = this.conf;

        test.expect(4);

        conf.init(this.basePath);
        test.equals(conf.get('hello'), 'world');

        conf.setObject({
                "hello": "changed",
                "sub": {
                    "a": "default",
                    "b": "changed"
                },
                "many": [
                    1
                ]
            }
        );
        test.equals(conf.get('hello'), 'changed');
        conf.save(function (err) {
            test.ifError(err);

            test.deepEqual(fs.readJsonFileSync(conf.localFile()),
                {
                    "hello": "changed",
                    "sub": {
                        "b": "changed"
                    },
                    "many": [
                        1
                    ]
                });
            test.done();
        });

    },

    testNoChange: function (test) {
        var conf = this.conf,
            self = this;

        test.expect(2);

        conf.init(this.basePath);

        conf.save(function (err) {
            var resolve = path.resolve(self.localConfig);
            test.ifError(err);

            test.deepEqual(fs.existsSync(resolve), false);

            test.done();
        });
    },

    testSaveWithoutInit: function (test) {
        var conf = this.conf;

        test.expect(1);

        conf.save(function (err) {
            test.equals(err.message, "e2e-conf hasn't been initialized.");

            test.done();
        });
    },

    testCorruptDefaultFile: function (test) {
        var conf = this.conf;

        test.expect(2);

        conf.init(this.basePath);
        test.equals(conf.get('hello'), 'world');

        conf.set('hello', 'changed');

        // destroy default configuration
        fs.copySync(path.resolve(__dirname, 'save.test.js'), conf.defaultFile());

        conf.save(function (err) {
            test.ok((err.message === 'Unexpected token /') // node > 4.0
                 || (err.type === "unexpected_token"));   // node = 0.10

            test.done();
        });
    }

};

process.on('uncaughtException', function (err) {
    console.error(err.stack);
});
