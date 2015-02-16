'use strict';
var _chars = require('./chars');
var _mixins = require('./mixins');
var _params = require('./params');
var _variables = require('./variables');


exports.ify = function(input) {
    var parents = [];

    return input.filter(function(elem) {return elem.l || elem.r;}).
            map(function(line) {
        var elem = {name: line.r, children: [], ind: line.l.length};
        var parent = parents[parents.length - 1] || {ind: 0};

        if (parent.ind === elem.ind) {
            parents.pop();
            parent = parents[parents.length -1] || {ind: 0};
        }
        elem.parent = parent;

        if (elem.ind === 0) {
            parents = [elem];
            elem.parent = null;
            return elem;
        }
        else if (parent.ind < elem.ind) {
            parents.push(elem);
            parent.children.push(elem);
        }
    }).filter(function(a) {return a;});
};

function printTree(tree, i) {
    i = i || 0;

    tree.forEach(function(k) {
        console.log('depth: ' + i);
        console.log('name: ' + k.name);
        console.log('parent: ' + k.parent);

        printTree(k.children, i + 1);
    });
}
exports.print = printTree;

function transformTree(tree) {
    var variables = _variables.find(tree);
    var mixins = _mixins.find(tree);
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
                var mixinParams = _params.set(mixin.params, values);

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
exports.transform = transformTree;
