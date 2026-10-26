import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createApp } from './app.js';
import { initDb } from './db.js';

const port = Number(process.env.PORT || 3001);
const app = createApp();
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(currentDir, '../../client/dist');

app.use(express.static(clientDist));
app.use((_req, res) => res.sendFile(path.join(clientDist, 'index.html')));

await initDb();
app.listen(port, () => {
  console.log(`AI Gate is running at http://localhost:${port}`);
});

