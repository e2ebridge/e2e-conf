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

    testNoDifference: function (test) {
        var conf = this.conf;

        test.deepEqual(conf._difference({a: 1}, {a: 1}), {});
        test.done();
    },

    testNoDifference2: function (test) {
        var conf = this.conf;

        test.deepEqual(conf._difference({a: 1}, {}), {});
        test.done();
    },

    testDifferenceOneProperty: function (test) {
        var conf = this.conf;

        test.deepEqual(conf._difference({a: 1}, {a: 2}), {a: 2});
        test.done();
    },

    testDifferenceTwoProperties: function (test) {
        var conf = this.conf;

        test.deepEqual(conf._difference({a: 1, b: 1}, {a: 2, b: 1}), {a: 2});
        test.done();
    },

    testDifferencePreserveProperties: function (test) {
        var conf = this.conf;

        test.deepEqual(conf._difference({a: 1, b: 1}, {a: 2, b: 1, c: 3}), {a: 2, c: 3});
        test.done();
    },

    testDifferenceObject: function (test) {
        var conf = this.conf;

        test.deepEqual(conf._difference({
            o: {a: 1, b: 1, c: []}
        }, {
            o: {a: 2, b: 1, c: [2]}
        }), {
            o: {a: 2, c: [2]}
        });
        test.done();
    },

    testDifferencePreserveObjectProperties: function (test) {
        var conf = this.conf;

        test.deepEqual(conf._difference({
            o: {a: 1, b: 1, c: []}
        }, {
            o: {a: 2, b: 1, c: [2], d: 7}
        }), {
            o: {a: 2, c: [2], d: 7}
        });
        test.done();
    },

    testDifferenceObjectAndEmpty: function (test) {
        var conf = this.conf;

        test.deepEqual(conf._difference({o: {a: 1, b: 1, c: []}}, {}), {});
        test.done();
    },

    testDifferenceArray: function (test) {
        var conf = this.conf;

        test.deepEqual(conf._difference([], [1]), [1]);
        test.done();
    },

    testDifferenceArrayNoDifference: function (test) {
        var conf = this.conf;

        test.deepEqual(conf._difference([
            {a: 1}
        ], [
            {a: 1}
        ]), undefined);
        test.done();
    },

    testDifferenceSubArrayNoDifference: function (test) {
        var conf = this.conf;

        test.deepEqual(conf._difference({a:['b','c']}, {a:['b','c']}), {});
        test.done();
    },

    testDifferenceSubArrayAddElement: function (test) {
        var conf = this.conf;

        test.deepEqual(conf._difference({a:['b','c']}, {a:['b','c','d']}), {a:['b','c','d']});
        test.done();
    },

    testDifferenceSubArrayRemoveElement: function (test) {
        var conf = this.conf;

        test.deepEqual(conf._difference({a:['b','c']}, {a:['c']}), {a:['c']});
        test.done();
    }

};


