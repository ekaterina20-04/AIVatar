import assert from 'node:assert/strict';
import test from 'node:test';
import { COOKIE_NAME, parseCookies } from '../src/session.js';

test('parseCookies reads the anonymous session cookie', () => {
  assert.deepEqual(parseCookies(`${COOKIE_NAME}=abc-123; theme=dark`), {
    [COOKIE_NAME]: 'abc-123',
    theme: 'dark',
  });
});

test('parseCookies supports values containing equals signs', () => {
  assert.equal(parseCookies('token=a%3Db').token, 'a=b');
});

