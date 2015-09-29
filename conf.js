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
        return Object.keys(left).every(function (prop) {
            return compare(left[prop], right[prop]);
        });
    } else {
        return left === right;
    }
}

function _checkInitialized() {
    if(!initialized) {
        throw new Error("e2e-conf hasn't been initialized.");
    }
}

function _initFiles(configPath, localConfig) {
    if (!configPath) {
        throw new Error("Cannot initialize e2e-conf without config path");
    }

    this.defaultFileName = localConfig ? configPath : path.resolve(configPath, 'config/default/config.json');
    this.localDirectory = localConfig ? path.dirname(localConfig) : path.resolve(configPath, 'config/local');
    this.localFileName = localConfig ? localConfig : path.resolve(this.localDirectory, 'config.json');

    nconf.file('local', {file: this.localFileName})
        .file('default', {file: this.defaultFileName});
}

/**
 * Initialize the configuration with custom path(s).
 *
 * @param {String} configPath Directory where the configuration files are looked up or path to default config file.
 * @param {String?} localConfig Path to local config file. If given, configPath is interpreted as path to default config file.
 *
 */
exports.init = function init(configPath, localConfig) {
    if (!initialized) {

        nconf.argv()
            .env('__');

        _initFiles.apply(this, arguments);

        initialized = true;
    } else {
        throw new Error("Calling init() twice does not work. Call cleanUp() in between.");
    }
};

/**
 * Initialize the configuration with custom path(s) and only values from files and not from program arguments
 * or environment.
 *
 * @param {String} configPath Directory where the configuration files are looked up or path to default config file.
 * @param {String?} localConfig Path to local config file. If given, configPath is interpreted as path to default config file.
 */
exports.initOnlyFiles = function init(configPath, localConfig) {
    if (!initialized) {

        _initFiles.apply(this, arguments);

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
    _checkInitialized();

    return nconf.get(key);
};

/**
 * Sets the `value` for the specified `key`.
 *
 * @param {String} key Key to set in this instance
 * @param {literal|Object} value Value for the specified key
 */
exports.set = function set(key, value) {
    _checkInitialized();

    return nconf.set(key, value);
};

/**
 * Sets all properties from the object.
 *
 * @param {Object} object Values to set.
 */
exports.setObject = function setObject(object) {
    _checkInitialized();

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

    if (typeof actualConf === 'function') {
        callback = actualConf;
        actualConf = nconf.stores.local && nconf.stores.local.store;
    }

    try {
        _checkInitialized();
    } catch(e) {
        if(typeof callback === 'function') {
            return callback(e);
        } else {
            throw e;
        }
    }

    async.waterfall([
        function (callback) {
            fs.ensureDir(self.localDirectory, function (err, dirName) {
                callback(err, dirName);
            });
        },
        function (dirName, callback) {
            fs.readJsonFile(self.defaultFileName, function (err, defaultConf) {
                callback(err, defaultConf);
            });
        },
        function (defaultConf, callback) {
            var diff = difference(defaultConf, actualConf);

            if( diff === undefined) {
                fs.delete(self.localFileName, callback);
            } else {
                fs.writeFile(self.localFileName, JSON.stringify(diff, null, '  '), callback);
            }
        }
    ], callback);
};

/**
 * Get path of local configuration file.
 *
 * @returns {String} Local configuration file path
 */
exports.localFile = function localFile() {
    _checkInitialized();

    return this.localFileName;
};

/**
 * Get path of default configuration file.
 *
 * @returns {String} Default configuration file path
 */
exports.defaultFile = function defaultFile() {
    _checkInitialized();

    return this.defaultFileName;
};

var difference = exports._difference = function difference(base, actual) {
    var diff = {},
        same = true;

    if (Array.isArray(base)) {
        diff = compare(base, actual) ? undefined : actual;
    } else {
        Object.keys(actual).forEach(function (prop) {
            var value = base[prop],
                localDiff;

            if (prop in base) {
                if (value instanceof Object) {
                    localDiff = difference(value, actual[prop]);
                    if( localDiff !== undefined) {
                        diff[prop] = localDiff;
                        same = false;
                    }
                } else {
                    if (value !== actual[prop]) {
                        diff[prop] = actual[prop];
                        same = false;
                    }
                }
            }
            else {
                diff[prop] = actual[prop];
                same = false;
            }
        });
        if(same) {
            diff = undefined;
        }
    }

    return diff;
};
