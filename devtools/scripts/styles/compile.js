const sass = require('sass');
const fs = require('fs');
const path = require('path');

const outputDir = 'app/local/alps/css';

const filesToCompile = [
  'app/local/source/css/main.scss',
  'app/local/source/css/main-bluejay.scss',
  'app/local/source/css/main-campfire.scss',
  'app/local/source/css/main-cave.scss',
  'app/local/source/css/main-denim.scss',
  'app/local/source/css/main-earth.scss',
  'app/local/source/css/main-emperor.scss',
  'app/local/source/css/main-forest.scss',
  'app/local/source/css/main-grapevine.scss',
  'app/local/source/css/main-iris.scss',
  'app/local/source/css/main-lily.scss',
  'app/local/source/css/main-ming.scss',
  'app/local/source/css/main-nad-amethyst.scss',
  'app/local/source/css/main-nad-branch.scss',
  'app/local/source/css/main-nad-denim.scss',
  'app/local/source/css/main-nad-miracle.scss',
  'app/local/source/css/main-nad-nile.scss',
  'app/local/source/css/main-nad-spark.scss',
  'app/local/source/css/main-nad-vine.scss',
  'app/local/source/css/main-night.scss',
  'app/local/source/css/main-scarlett.scss',
  'app/local/source/css/main-treefrog.scss',
  'app/local/source/css/main-velvet.scss',
  'app/local/source/css/main-winter.scss',
  'app/local/source/css/wp-editor.scss'
];

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

(async () => {
  console.log('🎯 Compiling styles and js files for ALPS Theme!');
  console.log('🏃 Run command');

  for (const sourcePath of filesToCompile) {
    const fileName = path.basename(sourcePath);
    const outputPath = path.join(outputDir, fileName.replace('.scss', '.css'));

    try {
      const result = await sass.compile(sourcePath, {
        style: 'compressed'
      });

      fs.writeFileSync(outputPath, result.css, (err) => {
        if (err) {
          console.error('Error while write file:', err);
        }
      });
      console.log(`✅ SUCCESS: ${fileName} compiled to ${outputPath}`);
    } catch (err) {
      console.error(`❌ Error in compilation process for ${fileName}:`, err);
    }
  }

  console.log('💚 The new version of styles and js were compiled successfully!');
})();
