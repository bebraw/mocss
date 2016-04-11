'use strict';


module.exports = function(input) {
  return input.map(function(line) {
    var rPart = line.trimLeft();

    return {
      l: line.replace(rPart, ''),
      r: rPart
    };
  });
};