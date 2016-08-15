#! /usr/bin/env node

/* eslint-env node */
/* eslint no-console:0 */

const http = require('http');

const options = {
  host: 'www.aftonbladet.se',
  port: 80
};

let justNu = 0;

function getJustNuCount (string) {
  return (string.match(/JUST NU:/g) || []).length;
}

function reportAndClose () {
  console.log('Antal "JUST NU" just nu:', justNu);
  process.exit(0);
}

const req = http.request(options, res => {
  res.setEncoding('utf8');

  res.on('data', chunk => {
    justNu += getJustNuCount(chunk);
  });

  res.on('end', reportAndClose);
});

req.end();
