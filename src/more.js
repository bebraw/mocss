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
            parent = parents[parents.length - 1] || {ind: 0};

            elem = {name: line.r, children: [], ind: line.l.length};

            if (parent.ind == elem.ind) {
                parents.pop();
                parent = parents[parents.length -1] || {ind: 0};
            }

            if (elem.ind == 0) {
                parents = [elem];
                return elem;
            }
            else if (parent.ind < elem.ind) {
                parents.push(elem);
                parent.children.push(elem);
            }
        }).filter(function(elem) {return elem;});
    }

    var printTree = function(tree, i) {
        i = i || 0;

        tree.forEach(function(k) {
            if (k.children.length > 0) {
                console.log('depth: ' + i);
                console.log(k);
                
                printTree(k.children, i + 1);
            }
        });
    }

    var transform = function(lines) {
        var bracketFound = false;

        return lines.map(function(line) {
            if (line.l) {
                return line.l + line.r + ';';
            }
            else if (line.r) {
                bracketFound = true;
                
                return line.r + ' {';
            }
            else if (bracketFound) {
                bracketFound = false;

                return '}';
            }
        });
    };

    var parts = analyze(data.split('\n'));
    var tree = treeify(parts);
    printTree(tree);
    var output = transform(tree).join('\n');

    fs.writeFile(target, output, function(err) {
        if (err) throw err;

        console.log('Wrote ' + target + '!');
    });
});

