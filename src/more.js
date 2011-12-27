#!/usr/bin/env node
var fs = require('fs');

var source = process.argv.splice(2)[0];
var target = source.substring(0, source.lastIndexOf('.')) + '.css';

fs.readFile(source, 'utf-8', function(err, data) {
    if (err) throw err;

    var analyze = function(input) {
        return input.map(function(line) {
            var rPart = line.trimLeft();

            return {l: line.replace(rPart, ''), r: rPart};
        });
    };

    var treeify = function(input) {
        var parents = [];

        return input.filter(function(elem) {return elem.l || elem.r;}).
                map(function(line) {
            elem = {name: line.r, children: [], ind: line.l.length};
            parent = parents[parents.length - 1] || {ind: 0};

            if (parent.ind == elem.ind) {
                parents.pop();
                parent = parents[parents.length -1] || {ind: 0};
            }
            elem.parent = parent;

            if (elem.ind == 0) {
                parents = [elem];
                elem.parent = null;
                return elem;
            }
            else if (parent.ind < elem.ind) {
                parents.push(elem);
                parent.children.push(elem);
            }
        }).filter(function(elem) {return elem;});
    };

    var printTree = function(tree, i) {
        i = i || 0;

        tree.forEach(function(k) {
            console.log('depth: ' + i);
            console.log('name: ' + k.name);
            console.log('parent: ' + k.parent);

            printTree(k.children, i + 1);
        });
    };

    var chars = function(c, n) {
        var ret = '';

        for(var i = 0; i < n; i++) {
            ret += c;
        }
        
        return ret;
    };
    
    var transform = function(tree) {
        var variables;
        var mixins;
        var nested = [];

        var findVariables = function(tree) {
            var ret = {};
            
            tree.forEach(function(child) {
                if (child.name[0] == '@') {
                    var parts = child.name.split(':');
                    ret[parts[0]] = parts[1].trim();
                }
            });

            return ret;
        };
        variables = findVariables(tree);

        var replaceVariables = function(line) {
            for(var k in variables) {
                var v = variables[k];

                line = line.replace(k, v);
            }

            return line;
        };

        var findMixins = function(tree) {
            var ret = {};

            var parseParams = function(line) {
                var parts;

                line = line.trim();
                line = line.substr(1, line.length - 2);
                parts = line.split(',');

                return parts.map(function(k) {
                    var segments = k.split(':');

                    return {name: segments[0], value: segments[1]}
                });
            };

            tree.forEach(function(child) {
                if (child.name.search('mixin ') == 0) {
                    var parts = child.name.split(' ');
                    var name = parts[1];
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
        };
        mixins = findMixins(tree);

        var recursion = function(tree, i) {
            return tree.map(function(child) {
                if(child.deleted) {
                    return '';
                }
                
                var prefix = chars(' ', i * 4);
                var ret = prefix + replaceVariables(child.name);

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

            ret.push(transform(nested));
        }

        return ret.filter(function(o) {return o;});
    };

    var parts = analyze(data.split('\n'));
    var tree = treeify(parts);
    var output = transform(tree).join('\n');
    console.log(output);

    fs.writeFile(target, output, function(err) {
        if (err) throw err;

        console.log('Wrote ' + target + '!');
    });
});

