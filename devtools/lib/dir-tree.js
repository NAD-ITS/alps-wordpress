const fs = require('fs').promises;

const dirTree = async (path, { whiteList = [], excludeList = [], rootPath = ''} = {}) => {
    const tree = [];
    const files = await fs.readdir(path);

    for (const file of files) {
        const filePath = `${path}/${file}`;
        const fileStat = await fs.stat(filePath);

      // Skip excluded files
      if (excludeList.some(ex => filePath.includes(ex))) {
        continue;
      }

        if (fileStat.isDirectory()) {
            tree.push(...await dirTree(filePath, {
                whiteList,
                excludeList,
                rootPath: rootPath ? rootPath : path,
            }));
        } else {
            const replacePath = rootPath ? rootPath : path;
            tree.push(filePath.replace(`${replacePath}/`, '/'));
        }
    }

    if (rootPath) {
        return tree;
    }

    return tree.filter((item) => {
        for (const pattern of whiteList) {
            if (item.match(pattern)) {
                return true;
            }
        }

        return false;
    })
};

module.exports = dirTree;
