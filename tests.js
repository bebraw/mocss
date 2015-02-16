'use strict';
var m = require('./lib');
var suite = require('suite.js');

suite(m.analyze, [
    [['a']], [{l: '', r: 'a'}],
    [['a', 'b']], [{l: '', r: 'a'}, {l: '', r: 'b'}],
    [['  a']], [{l: '  ', r: 'a'}],
    [['a', '  b']], [{l: '', r: 'a'}, {l: '  ', r: 'b'}]
]);

suite(analyzeAndTreeify, {
    '': [],
    'a': [{name: 'a', children: [], parent: null, ind: 0}]
    // TODO: figure out a smarter way to test this. parent is ref to actual ob!!!
    // perhaps it's possible to eliminate parent ref here?
    //'a,  b': [{name: 'a', children: [{name: 'b', parent: null}], parent: null, ind: 0}]
});

function analyzeAndTreeify(a) {
    return m.treeify(m.analyze([a]));
}

suite(m.chars, [
    ['c', 5], 'ccccc',
    ['a', 2], 'aa'
]);

suite(m.findVariables, {
    'a': {},
    '@a': {},
    '@a = 2': {},
    '@a: 2': {'@a': '2'},
    '@a : 2': {'@a': '2'}
}, function(a) {return [m.treeify(m.analyze([a]))];});

