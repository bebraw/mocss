'use strict';
var suite = require('suite.js');

var chars = require('../lib/chars');


suite(chars, [
    ['c', 5], 'ccccc',
    ['a', 2], 'aa'
]);
