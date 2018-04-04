const justNu = require('./index.js');

(async () => {
  try {
    const data = await justNu();
    console.log(data);
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
})();
