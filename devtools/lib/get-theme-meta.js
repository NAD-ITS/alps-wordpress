const fs = require('fs').promises;

const getThemeMeta = async () => {
  return JSON.parse(await fs.readFile('alps-wordpress-v3.json', {encoding: 'utf-8'}));
};

module.exports = getThemeMeta;
