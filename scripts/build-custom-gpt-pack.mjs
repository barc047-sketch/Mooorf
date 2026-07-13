import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'custom-gpt/upload-pack/UPLOAD_MANIFEST.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const outputRoot = path.resolve(root, process.argv[2] || '.custom-gpt-pack');

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });

function copy(relative, outputName) {
  const source = path.join(root, relative);
  if (!fs.existsSync(source)) throw new Error(`Missing pack source: ${relative}`);
  fs.copyFileSync(source, path.join(outputRoot, outputName));
}

copy(manifest.instructions_file, 'INSTRUCTIONS_TO_PASTE.md');
manifest.knowledge_files.forEach((relative, index) => {
  const name = `${String(index + 1).padStart(2, '0')}_${path.basename(relative)}`;
  copy(relative, name);
});

fs.copyFileSync(manifestPath, path.join(outputRoot, 'UPLOAD_MANIFEST.json'));
fs.copyFileSync(
  path.join(root, 'custom-gpt/GPT_SETUP_GUIDE.md'),
  path.join(outputRoot, 'GPT_SETUP_GUIDE.md')
);
fs.copyFileSync(
  path.join(root, 'custom-gpt/validation/CUSTOM_GPT_TEST_SUITE.md'),
  path.join(outputRoot, 'CUSTOM_GPT_TEST_SUITE.md')
);

console.log(`Custom GPT upload pack built at ${outputRoot}`);
