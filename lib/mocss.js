'use strict';

exports.transform = transform;
exports.analyze = analyze;
exports.treeify = treeify;
exports.chars = chars;
exports.printTree = printTree;
exports.transformTree = transformTree;
exports.findVariables = findVariables;
exports.replaceVariables = replaceVariables;
exports.findMixins = findMixins;
exports.setParams = setParams;
exports.parseParams = parseParams;

function transform(data) {
    var parts = analyze(data.split('\n'));
    var tree = treeify(parts);

    return transformTree(tree).join('\n');
}

function analyze(input) {
    return input.map(function(line) {
        var rPart = line.trimLeft();

        return {l: line.replace(rPart, ''), r: rPart};
    });
}

function treeify(input) {
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

function chars(c, n) {
    var ret = '';

    for(var i = 0; i < n; i++) {
        ret += c;
    }

    return ret;
}

function transformTree(tree) {
    var variables = findVariables(tree);
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

            var prefix = chars(' ', i * 4);
            var name = replaceVariables(replaceVariables(child.name, vars), variables);
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

function findVariables(tree) {
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
}

function replaceVariables(line, vars) {
    for(var k in vars) {
        var v = vars[k];

        line = line.replace(k, v);
    }

    return line;
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
