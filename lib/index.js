'use strict';

var _analyze = require('./analyze');
var _chars = require('./chars');
var _treeify = require('./treeify');
var _variables = require('./variables');

exports.transform = transform;
exports.printTree = printTree;
exports.transformTree = transformTree;
exports.findMixins = findMixins;
exports.setParams = setParams;
exports.parseParams = parseParams;

function transform(data) {
    var parts = _analyze(data.split('\n'));
    var tree = _treeify(parts);

    return transformTree(tree).join('\n');
}

function printTree(tree, i) {
    i = i || 0;

    tree.forEach(function(k) {
        console.log('depth: ' + i);
        console.log('name: ' + k.name);
        console.log('parent: ' + k.parent);

        printTree(k.children, i + 1);
    });
}

function transformTree(tree) {
    var variables = _variables.find(tree);
    var mixins = findMixins(tree);
    var nested = [];

    var recursion = function(tree, i, vars) {
        return tree.map(function(child) {
            if (child.deleted) {
                return '';
            }

            var ret = '';
            var parts = child.name.split(':');
            var begin = parts[0];
            if (begin in mixins) {
                var values = parts[1] || '';
                values = values.trim().split(' ');
                var mixin = mixins[begin];
                var mixinParams = setParams(mixin.params, values);

                ret += recursion(mixin.children, i, mixinParams).join('\n');

                return ret;
            }

            var prefix = _chars(' ', i * 4);
            var name = _variables.replace(_variables.replace(child.name, vars), variables);
            ret = prefix + name;

            if (child.children.length) {
                if (child.parent) {
                    // going to handle these later separately
                    // we'll lose positional data but it's
                    // a bit easier this way
                    // alternatively could try to sort attributes
                    // within blocks and then render nesting here
                    nested.push(child);
                    ret = '';
                }
                else {
                    ret += ' {\n' + recursion(child.children, i + 1).join('\n') + '\n}\n';
                }
            }
            else {
                ret += ';';
            }

            return ret;
        });
    };
    var ret = recursion(tree, 0);

    var getFullName = function(child) {
        return child.parent? getFullName(child.parent) + ' ' + child.name: child.name;
    };

    if (nested.length) {
        nested = nested.map(function(child) {
            child.name = getFullName(child);
            child.parent = null;

            return child;
        });

        ret.push(transformTree(nested));
    }

    return ret.filter(function(o) {return o;});
}

function findMixins(tree) {
    var ret = {};

    tree.forEach(function(child) {
        if (child.name.search('mixin ') === 0) {
            var parts = child.name.split(' ');
            var params = parseParams(parts.slice(2).join(''));

            ret[child.name.split(' ')[1].trim()] = {
                children: child.children,
                params: params
            };

            // mark as deleted so we can avoid this later
            child.deleted = true;
        }
    });

    return ret;
}

function parseParams(line) {
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
}

function setParams(params, values) {
    values = values || [];
    var ret = {};
    var i = 0;

    for(var k in params) {
        ret[k] = values[i] || params[k];

        i++;
    }

    return ret;
}
