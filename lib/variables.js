'use strict';

exports.find = function(tree) {
    var ret = {};

    tree.forEach(function(child) {
        if (child.name[0] === '@') {
            var parts = child.name.split(':');

            if(parts[1]) {
                ret[parts[0].trim()] = parts[1].trim();
            }

            child.deleted = true;
        }
    });

    return ret;
};

exports.replace = function(line, vars) {
    for(var k in vars) {
        var v = vars[k];

        line = line.replace(k, v);
    }

    return line;
};
