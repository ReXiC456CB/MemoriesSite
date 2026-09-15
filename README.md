# Memory Archive

A personal archive app for photos, stories, and folders with user accounts and shared storage.

## Local development

1. Start the backend:
   ```bash
   python server.py
   ```
2. Open the app in the browser:
   ```text
   http://localhost:4173
   ```

## Deployment architecture

- Frontend and API: Vercel
- Shared storage: Supabase Postgres
- Local development: `server.py` and `data/memories.json`

## Required deployment config

The frontend already uses the Vercel API route by default:

```js
window.MEMORY_API_URL = '/api/memories';
```

For Vercel, add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `CORS_ORIGIN` in Project Settings -> Environment Variables. Never expose the service role key in frontend code.

Run `supabase.sql` once in the Supabase SQL Editor before the first deployment.

## Shared auth and sync

Authentication is validated by the backend and stored in the shared archive payload. The same login can be used from another device if both devices hit the same backend URL.

## Notes

- The app blocks unauthenticated users from creating, editing, or deleting folders and memories.
- The Vercel API stores the archive payload in Supabase so every device reads the same data.
- The local Python server remains available for local testing only.
