import { Alert } from 'react-native';

export const VOICE_MIC_COMING_SOON_TITLE = 'Coming soon';

export const VOICE_MIC_COMING_SOON_MESSAGE =
  'Voice billing is coming soon. Use manual billing for now.';

export const VOICE_MIC_FEATURE_ENABLED = false;

export function showVoiceComingSoon(): void {
  Alert.alert(VOICE_MIC_COMING_SOON_TITLE, VOICE_MIC_COMING_SOON_MESSAGE);
}
