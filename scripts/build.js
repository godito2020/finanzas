const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

const projectRoot = path.resolve(__dirname, '..');
const webOutput = path.join(projectRoot, 'www');
const webFiles = ['index.html', 'styles.css', 'manifest.webmanifest', 'sw.js', 'icon.svg', 'api-config.js'];

fs.mkdirSync(webOutput, { recursive: true });

const vendorOutput = path.join(projectRoot, 'vendor');
fs.mkdirSync(vendorOutput, { recursive: true });
fs.copyFileSync(
  path.join(projectRoot, 'node_modules', 'jspdf', 'dist', 'jspdf.umd.min.js'),
  path.join(vendorOutput, 'jspdf.umd.min.js')
);

esbuild.buildSync({
  entryPoints: [path.join(projectRoot, 'app.js')],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  outfile: path.join(projectRoot, 'app.bundle.js'),
  minify: true,
  target: ['es2020']
});

for (const file of webFiles) {
  fs.copyFileSync(path.join(projectRoot, file), path.join(webOutput, file));
}

fs.copyFileSync(path.join(projectRoot, 'app.bundle.js'), path.join(webOutput, 'app.bundle.js'));
fs.mkdirSync(path.join(webOutput, 'vendor'), { recursive: true });
fs.copyFileSync(path.join(vendorOutput, 'jspdf.umd.min.js'), path.join(webOutput, 'vendor', 'jspdf.umd.min.js'));
