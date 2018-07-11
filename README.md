# e2e-conf - Easy Configuration for E2E Bridge Node.js Services

## Description

If you use this module to access your configuration values then you can edit your configuration with a nice UI inside
 the E2E Bridge. At each deployment for development, testing or production you can change the configuration to match
 the environment and your needs.
Technically it is a wrapper to [nconf](https://github.com/flatiron/nconf).

## Installation

```sh
npm install e2e-conf
```

## Usage

As with all other Node.js modules, you need to require it and then you can read configuration value with **get()**.

```js
var conf = require('e2e-conf');
conf.init(__dirname);

var port = conf.get('host:port');
```

You must add a JSON file **config/default/config.json** to your service where you define all possible configuration
names and default values. The E2E Bridge will store all changed values to **config/local/config.json** which overrides
the default values.

You can also use command-line arguments or environment variables to change the configuration values. The order is:
1. command-line arguments
2. environment variables
3. changed values in the E2E Bridge (config/local/config.json)
4. default values (config/default/config.json)

If you want to change the configuration from the program you can use **set()** to change it and **save()** to store it.
 The changes are saved to **config/local/config.json** but only as difference to the default values from the file
 **config/default/config.json**.

The absolute file name of the changed values can be accessed with **localFile()** and the path of the default file with
 **defaultFile()**.

## Do the same without this module

If you don't want to save your changes with **save()** you could also use the [nconf](https://github.com/flatiron/nconf)
module directly. You still need to use the same paths for the JSON files.

```js
var nconf = require('nconf');
nconf.argv()
    .env('__')
    .file('local', { file: __dirname + '/config/local/config.json') })
    .file('default', { file: __dirname + '/config/default/config.json') });

```

## License

(The MIT License)

Copyright (c) 2014-2018 Scheer E2E AG

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
