# AIVatar

Минимальный рабочий AI-чат: React + Node.js + PostgreSQL.

## Архитектура

- React показывает чат и держит быстрый кэш в `localStorage`.
- Express создаёт анонимный UUID и сохраняет его в `httpOnly` cookie.
- PostgreSQL хранит сообщения по UUID сессии и является источником истины.
- Node.js вызывает любой OpenAI-совместимый `/chat/completions` API; ключ остаётся на сервере.

## Быстрый запуск

Требования: Node.js 20+, Docker.

```powershell
Copy-Item .env.example .env
# В .env укажите AI_API_KEY, AI_BASE_URL и AI_MODEL
docker compose up -d db
npm install
npm run dev
```

Открыть `http://localhost:5173`.

Для production-подобного локального запуска:

```powershell
npm run build
npm start
```

Открыть `http://localhost:3001`.

## API

- `GET /api/session` — текущая анонимная сессия.
- `GET /api/history` — история текущей сессии.
- `POST /api/chat` с `{ "message": "..." }` — запрос к AI.

## Что показать на скринкасте

1. Запустить PostgreSQL и `npm run dev`.
2. Открыть приложение без регистрации.
3. Отправить два сообщения и показать ответы.
4. Обновить страницу: история останется на месте.
5. В DevTools показать `ai-gate-history` в Local Storage и `ai_gate_session` в Cookies.
6. Выполнить запрос к БД:

```powershell
docker compose exec db psql -U postgres -d ai_gate -c 'SELECT session_id, role, content, created_at FROM messages ORDER BY id;'
```

Это демонстрирует cookie-сессию, localStorage и серверное хранение в PostgreSQL.
