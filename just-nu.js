#! /usr/bin/env node

/* eslint-env node */
/* eslint no-console:0 */

const http = require('http');
const colour = require('colour');

let justNuCount = 0
  , justNuTopics = [];

console.log(colour.yellow('  ---------------------'));
console.log(colour.yellow('  A F T O N B L A D E T'));
console.log(colour.yellow('  ---------------------'));
console.log('\n');

/**
 * Find number of "JUST NU:" in a string.
 *
 * @param {String} text - String to search in
 * @return {Number} - Occurances found.
 */
function getJustNuCount (text) {
  return (text.match(/JUST NU:/g) || []).length;
}

/**
 * Finds multiple "JUST NU" in a string and returns them in an array.
 *
 * @param {String} text - String to search in
 * @return {String[]} - Array of topics found.
 */
function saveTopic (text) {
  const justNus = text.split(/JUST NU:/g);
  let arr = [];

  for (let justNu of justNus) {
    if (justNu.indexOf('</span>') !== -1 && justNu.indexOf('</h2>') !== -1) {
      let topic = justNu.split('</span>')[1].split('</h2>')[0];

      if (topic.indexOf('<') === -1) {
        arr.push(topic);
      }
    }
  }

  return arr;
}

/**
 * Prints to console.
 *
 * @param {Number} count - Number of "JUST NU :"s to reportAndClose
 * @param {String[]} topics - Array of topics as strings to list in console.
 */
function reportAndClose (count, topics) {
  console.log(colour.white('  Antal "JUST NU" just nu:'), colour.cyan(count));

  console.log('\n');

  for (let topic of topics) {
    console.log('    ' + colour.red('√') + topic.toUpperCase());
  }

  process.exit(0);
}

http.request({ host: 'www.aftonbladet.se' }, res => {
  res.setEncoding('utf8');

  res.on('data', chunk => {
    let count = getJustNuCount(chunk);

    if (count > 0) {
      justNuCount += count;
      justNuTopics = justNuTopics.concat(saveTopic(chunk));
    }
  });

  res.on('end', () => reportAndClose(justNuCount, justNuTopics));
}).end();
