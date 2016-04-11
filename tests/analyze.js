'use strict';
var suite = require('suite.js');

var analyze = require('../lib/analyze');
var treeify = require('../lib/tree').ify;

suite(analyze, [
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
  return treeify(analyze([a]));
}
