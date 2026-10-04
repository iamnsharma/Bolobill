import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

async function main() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    console.error('OPENAI_API_KEY missing in bolobill-backend/.env');
    process.exit(1);
  }
  const client = new OpenAI({apiKey: key});
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );
  const dataUrl = `data:image/png;base64,${png.toString('base64')}`;
  try {
    const c = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: {type: 'json_object'},
      messages: [
        {
          role: 'user',
          content: [
            {type: 'text', text: 'Return {"ok":true}'},
            {type: 'image_url', image_url: {url: dataUrl}},
          ],
        },
      ],
      max_tokens: 50,
    });
    console.log('SUCCESS', c.choices[0]?.message?.content);
  } catch (e: unknown) {
    const err = e as {status?: number; code?: string; message?: string; error?: unknown};
    console.error('FAIL status=', err.status, 'code=', err.code);
    console.error('message=', err.message);
    if (err.error) console.error('body=', JSON.stringify(err.error));
    process.exit(1);
  }
}

main();
