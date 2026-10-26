import { randomUUID } from 'node:crypto';

export const COOKIE_NAME = 'ai_gate_session';

export function parseCookies(header = '') {
  return Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separator = part.indexOf('=');
        const key = separator === -1 ? part : part.slice(0, separator);
        const value = separator === -1 ? '' : part.slice(separator + 1);
        return [decodeURIComponent(key), decodeURIComponent(value)];
      }),
  );
}

export function getOrCreateSession(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  const current = cookies[COOKIE_NAME];
  const sessionId = /^[0-9a-f-]{36}$/i.test(current ?? '') ? current : randomUUID();

  if (sessionId !== current) {
    const secure = process.env.SESSION_COOKIE_SECURE === 'true' ? '; Secure' : '';
    res.setHeader(
      'Set-Cookie',
      `${COOKIE_NAME}=${sessionId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${secure}`,
    );
  }

  return sessionId;
}

