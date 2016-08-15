#! /usr/bin/env node

/* eslint-env node */
/* eslint no-console:0 */

const http = require('http');
const colour = require('colour');

let justNuCount = 0
  , justNuTopics = [];

console.log(colour.yellow('  ---------------------  '));
console.log(colour.yellow('  A F T O N B L A D E T  '));
console.log(colour.yellow('  ---------------------  '));
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
 * Finds multiple "subtitles" in a paragraph and returns them in an array.
 *
 * @param {String} text - String to search in
 * @return {String[]} - Array of topics found.
 */
function getParagraphParts (text) {
  const parts = text.split('<span');
  let subtitles = [];

  function containsArrow (str) {
    return str.indexOf('abIconArrow') !== -1;
  }

  function containsCheckmark (str) {
    return str.indexOf('abSymbBo') !== -1;
  }

  for (let part of parts) {
    if (containsArrow(part) || containsCheckmark(part)) {
      let symbol = part.split('</span>')[0]
        , subtitle = part.split('</span>')[1];

      symbol = containsArrow(symbol) ? '➞' : '√';

      if (subtitle.indexOf('</p>') !== -1) {
        subtitle = subtitle.split('</p>')[0];
      }

      subtitle = subtitle.trim();

      subtitles.push({
        symbol,
        subtitle
      });
    }
  }

  return subtitles;
}

/**
 * Finds multiple "JUST NU" in a string and returns them in an array.
 *
 * @param {String} text - String to search in
 * @return {String[]} - Array of topics found.
 */
function getTopics (text) {
  const justNus = text.split(/JUST NU:/g);
  let arr = [];

  for (let justNu of justNus) {
    if (justNu.indexOf('</span>') !== -1 && justNu.indexOf('</h2>') !== -1) {
      let header = justNu.split('</span>')[1].split('</h2>')[0].replace(/\s+/, '')
        , paragraphLine
        , subtitles
        ;

      if (header && header.indexOf('<') === -1) {
        paragraphLine = justNu.split(header)[1].split('</p>')[0];

        if (paragraphLine) {
          subtitles = getParagraphParts(paragraphLine);
        }

        arr.push({
          header,
          subtitles
        });
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
    let header = colour.red('JUST NU: ') + topic.header;

    console.log(`    ${header}`);

    for (let subtitle of topic.subtitles) {
      let symbol = colour.red(subtitle.symbol);

      console.log(`     ${symbol} ${subtitle.subtitle}`);
    }
  }

  process.exit(0);
}

http.request({ host: 'www.aftonbladet.se' }, res => {
  res.setEncoding('utf8');

  res.on('data', chunk => {
    let count = getJustNuCount(chunk);

    if (count > 0) {
      justNuCount += count;
      justNuTopics = justNuTopics.concat(getTopics(chunk));
    }
  });

  res.on('end', () => reportAndClose(justNuCount, justNuTopics));
}).end();
