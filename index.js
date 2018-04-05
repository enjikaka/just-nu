const fetch = require('isomorphic-fetch');

const smoosh = (a, b) => a.concat(b);

module.exports = function () {
  return fetch('http://aftonbladet.se')
    .then(r => r.text())
    .then(text => {
      const json = JSON.parse(text.split('<script>window.FLUX_STATE = ')[1].split('</script>')[0]);
      const collectionKey = Object.keys(json.collections)[0];
      const items = Object.values(json.collections[collectionKey].contents.items);

      const filteredItems = items
        .filter(item => JSON.stringify(item).indexOf('JUST NU') !== -1) // Filter items that does not contain the text JUST NU
        .map(item => item.type === 'widget' ? item.items : item) // Flatten "widgets"
        .reduce(smoosh) // Smoosh array of items from widet types
        .map(item => { // Filter out items in item that does not contain JUST NU
          item.items = item.items.filter(deepItem => JSON.stringify(deepItem).indexOf('JUST NU') !== -1);

          return item;
        });

      // Loop over the items in item and grab text or title values
      const topics = filteredItems.map(item => {
        return item.items.map(deepItem => {
          const newItem = {};

          if (deepItem.title && deepItem.title.value.indexOf('JUST NU') !== -1) {
            newItem.title = deepItem.title.value;
          }

          if (deepItem.text && deepItem.text.value.indexOf('JUST NU') !== -1) {
            newItem.title = deepItem.text.value;
          }

          if (deepItem.target && deepItem.target.expandedUri) {
            newItem.url = deepItem.target.expandedUri;
          }

          return Object.keys(newItem).length > 0 ? newItem : undefined;
        }).filter(Boolean);
      });

      const count = topics.length;

      return { count, topics };
    });
};
