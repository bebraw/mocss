#!/usr/bin/env node
var m = require('./more');
var suite = require('suite.js');

suite(m.analyze, {
    'a': [{l: '', r: 'a'}],
    'a,b': [{l: '', r: 'a'}, {l: '', r: 'b'}],
    '  a': [{l: '  ', r: 'a'}],
    'a,  b': [{l: '', r: 'a'}, {l: '  ', r: 'b'}]
}, function(a) {return a.split(',');});

