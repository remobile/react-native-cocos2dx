#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var args = process.argv.splice(2);
var srcPath = args[0];
var destPath = args[1];
var relativePath = path.relative(path.dirname(destPath), srcPath);
var unique = {};
var img="    img: {";
var plist="    plist: {";

function getFile(dir, file) {
    var basename = path.basename(file);
    var extname = path.extname(file);
    var purefilename = basename.replace(/(.*?)[@.].*/, '$1');
    var name = dir.replace(new RegExp(srcPath+'/|'+srcPath), '').split('/').join('_');
    name = name+(name?'_':'')+purefilename;
    var truePath = dir.replace(new RegExp(srcPath), relativePath);
    if (['.png', '.jpg', '.gif'].indexOf(extname) !== -1) {
        if (!unique[name]) {
            unique[name] = true;
            img=`${img}\n        ${name}:resolveAssetSource(require('./${truePath}/${purefilename}${extname}')).uri,`;
        }
    } else if (extname === '.plist') {
        plist=`${plist}\n        ${name}:resolveAssetSource(require('./${truePath}/${purefilename}${extname}')).uri,`;
    }
}

function getDir(dir) {
    fs.readdirSync(dir).forEach((item)=>{
        var target = path.join(dir, item);
        var stat = fs.statSync(target);
        if (stat.isDirectory()) {
            getDir(target);
        } else {
            getFile(dir, item);
        }
    });
}

getDir(srcPath);

img=`${img}\n    },`;
plist=`${plist}\n    },`;
var code = `var resolveAssetSource = require('resolveAssetSource');\nmodule.exports = {\n${img}\n${plist}\n};`;

fs.writeFileSync(destPath, code);
console.log('Ok!');
