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
                elem.parent = {name: null};
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
            console.log('depth: ' + i);
            console.log('name: ' + k.name);
            console.log('parent: ' + k.parent.name);

            printTree(k.children, i + 1);
        });
    }

    var transform = function(lines) {
        // TODO!
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

