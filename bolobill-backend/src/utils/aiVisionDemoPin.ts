import {ApiError} from '../common/ApiError';

const PIN_HEADER = 'x-bolobill-ai-demo-pin';

export function getAiVisionDemoPinFromEnv(): string {
  return (process.env.AI_VISION_DEMO_PIN ?? '').trim();
}

export function isAiVisionPinRequired(): boolean {
  return getAiVisionDemoPinFromEnv().length > 0;
}

export function assertAiVisionDemoPin(headerValue: string | undefined): void {
  const expected = getAiVisionDemoPinFromEnv();
  if (!expected) return;

  const provided = (headerValue ?? '').trim();
  if (!provided || provided !== expected) {
    throw new ApiError(403, 'AI photo import is locked. Enter the demo PIN.');
  }
}

export {PIN_HEADER};
