/**
 * Copyright: E2E Technologies Ltd
 */
'use strict';

const conf = require('./conf.js'),
    fs = require('fs-extra'),
    exit = require('exit'),
    argParser = new require('argparse').ArgumentParser({
        'addHelp': true,
        'epilog': 'Default is to display the configuration at stdout.'
    });

argParser.addArgument(
    '-u', {
        'metavar': '<upload file>',
        'help': 'Update configuration. Configuration is read from upload file.'
    });
argParser.addArgument(
    'configPath',
    {
        'help': 'Configuration path'
    });

const args = argParser.parseArgs(),
      uploadPath = args['u'];

conf.initOnlyFiles(args['configPath']);

if (uploadPath) {
    fs.readJsonFile(uploadPath, function (err, actualConfig) {
        if (err) {
            if (err instanceof SyntaxError) {
                process.stderr.write(`Invalid JSON: ${err.message}`);
                exit(1);
            } else {
                process.stderr.write(err.message);
                exit(2);
            }
        }
        if (actualConfig !== null) {
            conf.save(actualConfig, function () {
                exit();
            });
        }
    });
} else {
    process.stdout.write(JSON.stringify(conf.get(), null, 2));
    exit(0);
}
