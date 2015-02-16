'use strict';
var suite = require('suite.js');

var analyze = require('../lib/analyze');
var treeify = require('../lib/treeify');
var variables = require('../lib/variables');


suite(variables.find, {
    'a': {},
    '@a': {},
    '@a = 2': {},
    '@a: 2': {'@a': '2'},
    '@a : 2': {'@a': '2'}
}, function(a) {return [treeify(analyze([a]))];});
