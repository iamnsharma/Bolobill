export const VOICE_MIC_COMING_SOON_TITLE = "Coming soon";

export const VOICE_MIC_COMING_SOON_MESSAGE =
  "Voice billing is coming soon. Use manual billing or stock forms for now.";

/** When false, all mic / voice-record UI shows coming soon instead of recording. */
export const VOICE_MIC_FEATURE_ENABLED = false;

export function notifyVoiceComingSoon(onError?: (message: string) => void): void {
  if (onError) {
    onError(VOICE_MIC_COMING_SOON_MESSAGE);
    return;
  }
  window.alert(`${VOICE_MIC_COMING_SOON_TITLE}\n\n${VOICE_MIC_COMING_SOON_MESSAGE}`);
}
