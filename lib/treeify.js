'use strict';


module.exports = function(input) {
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
