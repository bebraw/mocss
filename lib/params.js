'use strict';


exports.parse = function(line) {
  var ret = {};
  var parts;

  line = line.trim();
  line = line.substr(1, line.length - 2);
  parts = line.split(',');

  parts.forEach(function(k) {
    var segments = k.split(':');

    ret[segments[0]] = segments[1];
  });

  return ret;
};

exports.set = function(params, values) {
  values = values || [];

  var ret = {};
  var i = 0;

  for (var k in params) {
    ret[k] = values[i] || params[k];

    i++;
  }

  return ret;
};