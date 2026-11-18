// Turn build/app.html into ./index.html with paths pointing into ./build/
import { readFileSync, writeFileSync } from 'node:fs';
let html = readFileSync('build/app.html', 'utf8');
html = html.replace(/(src|href)="\.\/(?!build\/)([^"]+)"/g, '$1="./build/$2"');
writeFileSync('index.html', html);
console.log('index.html written');
