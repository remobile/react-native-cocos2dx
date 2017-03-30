#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.splice(2);
const srcPath = args[0];
const destPath = args[1];
const relativePath = path.relative(path.dirname(destPath), srcPath);
const unique = {};
let img = '    img: {';
let plist = '    plist: {';

function getFile (dir, file) {
    const basename = path.basename(file);
    const extname = path.extname(file);
    const purefilename = basename.replace(/(.*?)[@.].*/, '$1');
    let name = dir.replace(new RegExp(srcPath + '/|' + srcPath), '').split('/').join('_');
    name = name + (name ? '_' : '') + purefilename;
    const truePath = dir.replace(new RegExp(srcPath), relativePath);
    if (['.png', '.jpg', '.gif'].indexOf(extname) !== -1) {
        if (!unique[name]) {
            unique[name] = true;
            img = `${img}\n        ${name}:resolveAssetSource(require('./${truePath}/${purefilename}${extname}')).uri,`;
        }
    } else if (extname === '.plist') {
        plist = `${plist}\n        ${name}:resolveAssetSource(require('./${truePath}/${purefilename}${extname}')).uri,`;
    }
}

function getDir (dir) {
    fs.readdirSync(dir).forEach((item) => {
        const target = path.join(dir, item);
        const stat = fs.statSync(target);
        if (stat.isDirectory()) {
            getDir(target);
        } else {
            getFile(dir, item);
        }
    });
}

getDir(srcPath);

img = `${img}\n    },`;
plist = `${plist}\n    },`;
const code = `const resolveAssetSource = require('resolveAssetSource');\nmodule.exports = {\n${img}\n${plist}\n};`;

fs.writeFileSync(destPath, code);
console.log('Ok!');
