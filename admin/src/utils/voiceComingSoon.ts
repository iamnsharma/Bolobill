export const VOICE_MIC_COMING_SOON_TITLE = "Coming soon";

/** Shown if a legacy mic entry point is used while the feature is off. */
export const VOICE_MIC_COMING_SOON_MESSAGE =
  "Quick dictation is coming soon. Use catalog billing and stock forms for now.";

/**
 * When true, enables mic UI across billing, stock, and out-of-stock flows.
 * Product label when shipped: "Quick dictation" (not "voice billing").
 */
export const VOICE_MIC_FEATURE_ENABLED = false;

export function notifyVoiceComingSoon(onError?: (message: string) => void): void {
  if (onError) {
    onError(VOICE_MIC_COMING_SOON_MESSAGE);
    return;
  }
  window.alert(`${VOICE_MIC_COMING_SOON_TITLE}\n\n${VOICE_MIC_COMING_SOON_MESSAGE}`);
}
