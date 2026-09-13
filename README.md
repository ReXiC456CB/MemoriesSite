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

- Frontend: Vercel
- Backend: Render / Railway / any Python hosting service
- Shared data: central JSON store or database served by the backend

## Required deployment config

Set the frontend API URL before deploying:

```js
window.MEMORY_API_URL = 'https://your-backend-url/api/memories';
```

Or keep the default local path for local testing and replace it in production.

## Shared auth and sync

Authentication is validated by the backend and stored in the shared archive payload. The same login can be used from another device if both devices hit the same backend URL.

## Notes

- The app blocks unauthenticated users from creating, editing, or deleting folders and memories.
- The backend accepts writes only from a logged-in user session that exists in the shared user list.
