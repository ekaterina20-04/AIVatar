export async function askAi(messages) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error('AI_API_KEY is not configured');
  }

  const baseUrl = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages: messages.map(({ role, content }) => ({ role, content })),
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`AI provider returned ${response.status}: ${details.slice(0, 300)}`);
  }

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content?.trim();
  if (!answer) {
    throw new Error('AI provider returned an empty answer');
  }
  return answer;
}

