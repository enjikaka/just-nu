#! /usr/bin/env node

/* eslint-env node */
/* eslint no-console:0 */

const http = require('http');

let justNu = 0;

function getJustNuCount (string) {
  return (string.match(/JUST NU:/g) || []).length;
}

function reportAndClose () {
  console.log('Antal "JUST NU" just nu:', justNu);
  process.exit(0);
}

http.request({ host: 'www.aftonbladet.se' }, res => {
  res.setEncoding('utf8');

  res.on('data', chunk => {
    justNu += getJustNuCount(chunk);
  });

  res.on('end', reportAndClose);
}).end();
