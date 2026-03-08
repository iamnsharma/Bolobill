const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-audio-recorder-player',
  'android',
  'src',
  'main',
  'java',
  'com',
  'dooboolab.audiorecorderplayer',
  'RNAudioRecorderPlayerModule.kt',
);

try {
  if (!fs.existsSync(targetFile)) {
    process.exit(0);
  }

  const source = fs.readFileSync(targetFile, 'utf8');
  let updated = source;

  updated = updated.replaceAll(
    '(currentActivity)!!',
    '(reactApplicationContext.currentActivity)!!',
  );
  updated = updated.replaceAll(
    'currentActivity!!.applicationContext',
    'reactApplicationContext.applicationContext',
  );

  if (updated !== source) {
    fs.writeFileSync(targetFile, updated, 'utf8');
    console.log('Patched RNAudioRecorderPlayerModule.kt for RN 0.81');
  }
} catch (error) {
  console.warn('postinstall audio-recorder-player legacy patch skipped:', error.message);
}
