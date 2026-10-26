import express from 'express';
import { askAi } from './ai.js';
import { getHistory, saveMessage } from './db.js';
import { getOrCreateSession } from './session.js';

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '32kb' }));

  app.use('/api', (req, res, next) => {
    req.sessionId = getOrCreateSession(req, res);
    next();
  });

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.get('/api/session', (req, res) => {
    res.json({ sessionId: req.sessionId });
  });

  app.get('/api/history', async (req, res, next) => {
    try {
      res.json({ messages: await getHistory(req.sessionId) });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/chat', async (req, res, next) => {
    try {
      const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
      if (!message || message.length > 4000) {
        return res.status(400).json({ error: 'Message must contain 1 to 4000 characters' });
      }

      const userMessage = await saveMessage(req.sessionId, 'user', message);
      const history = await getHistory(req.sessionId);
      const answer = await askAi(history.slice(-20));
      const assistantMessage = await saveMessage(req.sessionId, 'assistant', answer);

      return res.json({ messages: [userMessage, assistantMessage] });
    } catch (error) {
      return next(error);
    }
  });

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  });

  return app;
}

