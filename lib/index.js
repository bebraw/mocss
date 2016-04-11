'use strict';

var analyze = require('./analyze');
var tree = require('./tree');


module.exports = function(data) {
  return tree.transform(
    tree.ify(
      analyze(
        data.split('\n')
      )
    )
  ).join('\n');
};