import assert from 'node:assert/strict';
import test from 'node:test';
import { askAi } from '../src/ai.js';

test('askAi calls an OpenAI-compatible endpoint and returns its text', async (context) => {
  context.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://provider.test/v1/chat/completions');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.Authorization, 'Bearer test-key');
    assert.deepEqual(JSON.parse(options.body).messages, [
      { role: 'user', content: 'Привет' },
    ]);
    return new Response(JSON.stringify({
      choices: [{ message: { content: 'Здравствуйте!' } }],
    }));
  });

  const previous = {
    key: process.env.AI_API_KEY,
    url: process.env.AI_BASE_URL,
    model: process.env.AI_MODEL,
  };
  process.env.AI_API_KEY = 'test-key';
  process.env.AI_BASE_URL = 'https://provider.test/v1/';
  process.env.AI_MODEL = 'test-model';

  try {
    const answer = await askAi([{ role: 'user', content: 'Привет', id: 1 }]);
    assert.equal(answer, 'Здравствуйте!');
  } finally {
    if (previous.key === undefined) delete process.env.AI_API_KEY;
    else process.env.AI_API_KEY = previous.key;
    if (previous.url === undefined) delete process.env.AI_BASE_URL;
    else process.env.AI_BASE_URL = previous.url;
    if (previous.model === undefined) delete process.env.AI_MODEL;
    else process.env.AI_MODEL = previous.model;
  }
});

