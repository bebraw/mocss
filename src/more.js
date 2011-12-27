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

    var output = transform(analyze(data.split('\n'))).join('\n');

    fs.writeFile(target, output, function(err) {
        if (err) throw err;

        console.log('Wrote ' + target + '!');
    });
});

