/**
 * Copyright: E2E Technologies Ltd
 */
'use strict';

exports.testConf = {
    setUp: function (callback) {
        this.conf = require('../conf.js');

        callback();
    },

    tearDown: function (callback) {
        this.conf.cleanUp();

        callback();
    },

    withEnvironment: {
        setUp: function (callback) {
            process.env.hello = 'from env';

            callback();
        },

        tearDown: function (callback) {
            delete process.env.hello;

            callback();
        },

        testNoInit: function (test) {
            var conf = this.conf;
            test.throws(
                function() {
                    conf.get('hello');
                },
                Error,
                "e2e-conf hasn't been initialized."
            );
            test.done();
        },

        testEnvVariable: function (test) {
            var conf = this.conf;
            conf.init(__dirname + "/local");

            test.equal(conf.get('hello'), 'from env');
            test.equal(conf.get('version'), undefined);
            test.done();
        }

    },

    testDoubleInit: function (test) {
        var conf = this.conf;

        conf.init(__dirname);
        test.throws(function () {
            conf.init(__dirname);
        }, Error);
        test.done();
    },

    testOnlyDefaultFile: function (test) {
        var conf = this.conf;
        conf.init(__dirname);

        test.equal(conf.get('hello'), 'world');

        test.equal(conf.get('sub:a'), 'default');
        test.equal(conf.get('sub:b'), 'default');
        test.equal(conf.get('sub:c'), undefined);
        test.equal(Object.keys(conf.get('sub')).length, 2);

        test.equal(conf.get('many').length, 3);
        test.equal(conf.get('many')[0], 1);
        test.equal(conf.get('many:2'), 3);

        test.equal(conf.get('version'), undefined);
        test.done();
    },

    testSet: function (test) {
        var conf = this.conf;

        conf.init(__dirname);
        conf.set('hello', 'from code');
        test.equal(conf.get('hello'), 'from code');
        test.done();
    },

    testNoDefaultFile: function (test) {
        var conf = this.conf;
        conf.init("wrongDirectory");

        test.equal(conf.get('hello'), undefined);
        test.done();
    },

    testLocalFile: function (test) {
        var conf = this.conf;
        conf.init(__dirname + "/local");

        test.equal(conf.get('hello'), 'changed');

        test.equal(conf.get('sub:a'), 'changed');
        test.equal(conf.get('sub:b'), 'default');
        test.equal(conf.get('sub:c'), 'changed');
        test.equal(Object.keys(conf.get('sub')).length, 3);

        test.equal(conf.get('many').length, 2);
        test.equal(conf.get('many:0'), 4);
        test.equal(conf.get('many:1'), 3);

        test.equal(conf.get('version'), undefined);
        test.done();
    }


};


