'use strict';
var _params = require('./params').parse;


exports.find = function(tree) {
    var ret = {};

    tree.forEach(function(child) {
        if (child.name.search('mixin ') === 0) {
            var parts = child.name.split(' ');
            var params = _params.parse(parts.slice(2).join(''));

            ret[child.name.split(' ')[1].trim()] = {
                children: child.children,
                params: params
            };

            // mark as deleted so we can avoid this later
            child.deleted = true;
        }
    });

    return ret;
};
