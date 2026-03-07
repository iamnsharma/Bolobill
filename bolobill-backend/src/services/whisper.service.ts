import fs from 'fs';
import OpenAI from 'openai';
import {env} from '../config/env';

const openai = new OpenAI({apiKey: env.OPENAI_API_KEY});

export const transcribeAudio = async (
  localFilePath: string,
  language?: string,
): Promise<string> => {
  const whisperLanguage =
    language && !['mixed', 'bgr', 'mwr'].includes(language) ? language : undefined;

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(localFilePath),
    model: 'whisper-1',
    language: whisperLanguage,
    response_format: 'text',
  });

  return String(transcription || '').trim();
};
