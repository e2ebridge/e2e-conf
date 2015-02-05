/**
 * Copyright: E2E Technologies Ltd
 */
'use strict';

var nconf = require('nconf');
var path = require('path');
var fs = require('fs-extra');
var async = require('async');
var initialized = false;

function compare(left, right) {
    if (left instanceof  Object) {
        if (!(right instanceof Object)) {
            return false;
        }
        if (left.length !== right.length) {
            return false;
        }
        Object.keys(left).forEach(function (prop) {
            if (!compare(left[prop], right[prop])) {
                return false;
            }
        });
        return true;
    } else {
        return left === right;
    }
}

function _initFiles(basePath) {
    if (!basePath) {
        basePath = '.';
    }

    this.localDirectory = path.resolve(basePath, 'config/local');
    this.localFileName = path.resolve(this.localDirectory, 'config.json');
    this.defaultFileName = path.resolve(basePath, 'config/default/config.json');

    nconf.file('local', { file: this.localFileName })
        .file('default', { file: this.defaultFileName });
}

/**
 * Initialize the configuration with custom path.
 *
 * @param {String?} basePath Directory where the configuration files are looked up.
 */
exports.init = function init(basePath) {
    if (!initialized) {

        nconf.argv()
            .env('__');

        _initFiles.apply(this, [basePath]);

        initialized = true;
    } else {
        throw new Error("Calling init() twice does not work. Call cleanUp() in between.");
    }
};

/**
 * Initialize the configuration with custom path and only values from files and not from program arguments
 * or environment.
 *
 * @param {String} basePath Directory where the configuration files are looked up.
 */
exports.initOnlyFiles = function init(basePath) {
    if (!initialized) {

        _initFiles.apply(this, [basePath]);

        initialized = true;
    } else {
        throw new Error("Calling init() twice does not work. Call cleanUp() in between.");
    }
};

/**
 * Do a cleanup and after it you can call init() with a different argument.
 */
exports.cleanUp = function cleanUp() {
    // Remove our stores.
    nconf.remove('local');
    nconf.remove('default');
    nconf.remove('env');

    initialized = false;
};

/**
 * Get a value.
 *
 * @param {String?} key  If you want to get a property of an object use 'object_name:property'
 * otherwise use simple 'root_property'.
 * @returns {*} Value of name or undefined. Can be a simple type, object or array.
 */
exports.get = function get(key) {
    if (!initialized) {
        this.init();
    }

    return nconf.get(key);
};

/**
 * Sets the `value` for the specified `key`.
 *
 * @param {String} key Key to set in this instance
 * @param {literal|Object} value Value for the specified key
 */
exports.set = function set(key, value) {
    if (!initialized) {
        this.init();
    }

    return nconf.set(key, value);
};

/**
 * Sets all properties from the object.
 *
 * @param {Object} object Values to set.
 */
exports.setObject = function setObject(object) {
    if (!initialized) {
        this.init();
    }

    Object.keys(object).forEach(function (prop) {
        nconf.set(prop, object[prop]);
    });
};

/**
 * Save changes to local configuration file (difference only).
 * @param [actualConf] Current configuration which should be saved.
 * @param callback
 */
exports.save = function save(actualConf, callback) {
    var self = this;
    if (!initialized) {
        self.init();
    }

    if (typeof actualConf === 'function') {
        callback = actualConf;
        actualConf = nconf.stores.local.store;
    }

    async.waterfall([
        function (callback) {
            fs.ensureDir(self.localDirectory, function(err, dirName) {
                callback(err, dirName);
            });
        },
        function (dirName, callback) {
            fs.readJsonFile(self.defaultFileName, function(err, defaultConf) {
                callback(err, defaultConf);
            });
        },
        function (defaultConf, callback) {
            var diff = difference(defaultConf, actualConf);

            fs.writeFile(self.localFileName, JSON.stringify(diff, null, '  '), callback);
        }
    ], callback);
};

/**
 * Get path of local configuration file.
 *
 * @returns {String} Local configuration file path
 */
exports.localFile = function localFile() {
    if (!initialized) {
        this.init();
    }

    return this.localFileName;
};

/**
 * Get path of default configuration file.
 *
 * @returns {String} Default configuration file path
 */
exports.defaultFile = function defaultFile() {
    if (!initialized) {
        this.init();
    }

    return this.defaultFileName;
};

var difference = exports._difference = function difference(base, actual) {
    var diff = {};

    if (Array.isArray(base)) {
        diff = compare(base, actual) ? [] : actual;
    } else {
        Object.keys(actual).forEach(function (prop) {
            var value = base[prop];
            if (prop in base) {
                if (value instanceof Object) {
                    diff[prop] = difference(value, actual[prop]);
                } else {
                    if (value !== actual[prop]) {
                        diff[prop] = actual[prop];
                    }
                }
            }
            else {
                diff[prop] = actual[prop];
            }
        });
    }

    return diff;
};
