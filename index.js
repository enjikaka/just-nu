const fetch = require('node-fetch');

const smoosh = (a, b) => a.concat(b);

module.exports = function (callback) {
  // @ts-ignore
  return fetch('http://aftonbladet.se')
    .then(r => r.text())
    .then(text => {
      const json = JSON.parse(text.split('<script>window.FLUX_STATE = ')[1].split('</script>')[0]);
      const collectionKey = Object.keys(json.collections)[0];
      // @ts-ignore
      const items = Object.values(json.collections[collectionKey].contents.items);

      const filteredItems = items
        .filter(item => JSON.stringify(item).indexOf('JUST NU') !== -1)
        .map(item => {
          if (item.type === 'widget') {
            return item.items;
          }

          return item;
        })
        .reduce(smoosh)
        .map(item => {
          item.items = item.items.filter(item => JSON.stringify(item).indexOf('JUST NU') !== -1);
          return item;
        });

      const topics = filteredItems.map(item => {
        return item.items.map(deepItem => {
          if (deepItem.title && deepItem.title.value.indexOf('JUST NU') !== -1) {
            return deepItem.title.value;
          }

          if (deepItem.text && deepItem.text.value.indexOf('JUST NU') !== -1) {
            return deepItem.text.value;
          }
        });
      }).reduce(smoosh);

      const count = topics.length;

      return { count, topics };
    });
};
