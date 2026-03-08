const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-nitro-sound',
  'nitrogen',
  'generated',
  'android',
  'kotlin',
  'com',
  'margelo',
  'nitro',
  'sound',
  'HybridSoundSpec.kt',
);

const legacyBlock = `
  init {
    super.updateNative(mHybridData)
  }

  override fun updateNative(hybridData: HybridData) {
    mHybridData = hybridData
    super.updateNative(hybridData)
  }
`;

try {
  if (!fs.existsSync(targetFile)) {
    process.exit(0);
  }

  const source = fs.readFileSync(targetFile, 'utf8');
  if (!source.includes('super.updateNative(')) {
    process.exit(0);
  }

  const updated = source.replace(legacyBlock, '');
  if (updated !== source) {
    fs.writeFileSync(targetFile, updated, 'utf8');
    console.log('Patched react-native-nitro-sound HybridSoundSpec.kt');
  }
} catch (error) {
  console.warn('postinstall nitro-sound patch skipped:', error.message);
}
