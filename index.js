#! /usr/bin/env node

'use strict';

const http = require('http');

/**
 * Finds multiple "subtitles" in a paragraph and returns them in an array.
 *
 * @param {String} text - String to search in
 * @return {String[]} - Array of topics found.
 */
function getParagraphParts (text) {
  const parts = text.split('<span');
  const subtitles = [];

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

        header = header.replace(/\s+/g, ' ').trim();

        arr.push({
          header,
          subtitles
        });
      }
    }
  }

  return arr;
}

module.exports = function (callback) {
  let justNuCount = 0
    , justNuTopics = []
    ;

  http.request({ host: 'www.aftonbladet.se' }, res => {
    res.setEncoding('utf8');

    res.on('data', chunk => {
      justNuTopics = justNuTopics.concat(getTopics(chunk));
    });

    res.on('end', () => {
      const count = justNuTopics.length;
      const topics = justNuTopics;
      
      callback({ count, topics });
    });
  }).end();
};