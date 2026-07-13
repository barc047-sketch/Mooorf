import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'custom-gpt/upload-pack/UPLOAD_MANIFEST.json');
const requiredStatic = [
  'custom-gpt/README.md',
  'custom-gpt/GPT_INSTRUCTIONS.md',
  'custom-gpt/GPT_SETUP_GUIDE.md',
  'custom-gpt/bootstrap/BOOT_PROTOCOL.md',
  'custom-gpt/bootstrap/RECOVERY_PROTOCOL.md',
  'custom-gpt/state/CURRENT_PROJECT_STATE.json',
  'custom-gpt/state/STATE_SCHEMA.md',
  'custom-gpt/orchestration/ORCHESTRATION_OS.md',
  'custom-gpt/templates/TASK_CONTRACT.md',
  'custom-gpt/templates/AUDIT_QA_MERGE_GATES.md',
  'custom-gpt/validation/TRANSFER_INVENTORY.md',
  'custom-gpt/validation/CUSTOM_GPT_TEST_SUITE.md',
  'custom-gpt/validation/SECURITY_CHECKLIST.md',
  'custom-gpt/upload-pack/INSTRUCTIONS_TO_PASTE.md',
  'custom-gpt/upload-pack/UPLOAD_MANIFEST.json'
];

const forbiddenPatterns = [
  /github_pat_[A-Za-z0-9_]+/,
  /ghp_[A-Za-z0-9]+/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /(?:password|client_secret|access_token)\s*[:=]\s*['"][^'"]+['"]/i
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const relative of requiredStatic) {
  assert(fs.existsSync(path.join(root, relative)), `Missing required file: ${relative}`);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert(Array.isArray(manifest.knowledge_files) && manifest.knowledge_files.length === 4,
  'UPLOAD_MANIFEST.json must list exactly four Knowledge files.');

const allUploadFiles = [manifest.instructions_file, ...manifest.knowledge_files];
for (const relative of allUploadFiles) {
  const absolute = path.join(root, relative);
  assert(fs.existsSync(absolute), `Manifest file missing: ${relative}`);
  const content = fs.readFileSync(absolute, 'utf8');
  assert(content.trim().length > 200, `Upload file is unexpectedly small: ${relative}`);
  for (const pattern of forbiddenPatterns) {
    assert(!pattern.test(content), `Potential secret found in: ${relative}`);
  }
}

const state = JSON.parse(fs.readFileSync(path.join(root, 'custom-gpt/state/CURRENT_PROJECT_STATE.json'), 'utf8'));
for (const key of ['repository', 'recorded_main_sha', 'current_phase', 'current_gate', 'workers', 'boot_file']) {
  assert(state[key] !== undefined && state[key] !== null, `State missing required key: ${key}`);
}
assert(/^[0-9a-f]{40}$/.test(state.recorded_main_sha), 'recorded_main_sha must be a full 40-character SHA.');
assert(state.repository === manifest.repository, 'Repository mismatch between state and manifest.');
assert(manifest.security?.upload_secrets === false, 'Manifest must prohibit secret uploads.');
assert(manifest.security?.merge_permission_default === false, 'Merge permission must default to false.');

console.log(`Custom GPT pack valid: ${allUploadFiles.length} upload files, state schema present, no obvious secrets.`);
