from __future__ import annotations

import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_FILE = Path(os.environ.get("DATA_FILE") or str(DATA_DIR / "memories.json"))
CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "*")
DEFAULT_USERS = []
DEFAULT_FOLDERS = [
    {"id": "folder-travel", "name": "Путешествия", "icon": "", "createdBy": "Гость", "updatedBy": "Гость"},
    {"id": "folder-city", "name": "Город", "icon": "", "createdBy": "Гость", "updatedBy": "Гость"},
    {"id": "folder-family", "name": "Семья", "icon": "", "createdBy": "Гость", "updatedBy": "Гость"},
]
DEFAULT_ITEMS = [
    {
        "id": "memory-1",
        "image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        "title": "Летний вечер у воды",
        "date": "2024-07-11",
        "location": "Крым",
        "memory": "Это был тот вечер, когда небо постепенно становилось золотым, а все вокруг будто замедлялось. Мы сидели на берегу и говорили обо всем: о планах, о страхах, о мечтах, которые почему-то стали ближе. Я помню, как солнце уходило в воду, и казалось, что мир на секунду застыл, чтобы дать нам этот момент.",
        "folderId": "folder-travel",
        "author": "Демо",
        "createdBy": "Демо",
        "updatedBy": "Демо",
    },
    {
        "id": "memory-2",
        "image": "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80",
        "title": "Утро после дождя",
        "date": "2023-09-02",
        "location": "Москва",
        "memory": "По пути в кафе мы шли под ещё влажным воздухом, и улицы пахли свежестью. В тот день было чувство, будто после длинного периода все вдруг стало возможным. Я сделал этот кадр почти случайно, но потом он стал напоминанием о том, как важно замечать маленькие счастливые моменты.",
        "folderId": "folder-city",
        "author": "Демо",
        "createdBy": "Демо",
        "updatedBy": "Демо",
    },
]


def ensure_store() -> None:
    DATA_DIR.mkdir(exist_ok=True)
    if DATA_FILE.exists():
        payload = json.loads(DATA_FILE.read_text(encoding="utf-8")) if DATA_FILE.read_text(encoding="utf-8") else "{}"
        try:
            payload = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        except (TypeError, ValueError):
            payload = {}
        if isinstance(payload, dict):
            users = payload.get("users", [])
            clean_users = []
            for user in users:
                if not isinstance(user, dict):
                    continue
                username = str(user.get("username") or "").strip().lower()
                password = str(user.get("password") or "").strip()
                display_name = str(user.get("displayName") or user.get("username") or username).strip()
                if username and password:
                    clean_users.append({"username": username, "password": password, "displayName": display_name})
            payload["users"] = clean_users
            payload["session"] = {"username": "", "displayName": "", "isLoggedIn": False}
            DATA_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        return

    DATA_FILE.write_text(
        json.dumps(
            {
                "items": DEFAULT_ITEMS,
                "folders": DEFAULT_FOLDERS,
                "users": DEFAULT_USERS,
                "session": {"username": "", "displayName": "", "isLoggedIn": False},
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )


ensure_store()


class MemoryHandler(SimpleHTTPRequestHandler):
    def do_OPTIONS(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/memories":
            self.send_response(204)
            self._set_cors_headers()
            self.end_headers()
            return
        self.send_response(204)
        self._set_cors_headers()
        self.end_headers()

    def _set_cors_headers(self) -> None:
        origin = CORS_ORIGIN.strip() if CORS_ORIGIN else "*"
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Methods", "GET, PUT, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Max-Age", "600")

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/memories":
            self._send_json(self._read_store())
            return
        return super().do_GET()

    def do_PUT(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path != "/api/memories":
            self.send_response(404)
            self._set_cors_headers()
            self.end_headers()
            return

        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length)
        try:
            data = json.loads(body.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'{"error":"Invalid JSON"}')
            return

        if isinstance(data, list):
            items = data
            folders = DEFAULT_FOLDERS
            users = DEFAULT_USERS
            session = {"username": "", "displayName": "", "isLoggedIn": False}
        else:
            items = data.get("items", [])
            folders = data.get("folders", DEFAULT_FOLDERS)
            users = data.get("users", DEFAULT_USERS)
            session = data.get("session", {"username": "", "displayName": "", "isLoggedIn": False})

        username = str(session.get("username") or "").strip().lower()
        signed_in = bool(session.get("isLoggedIn")) and bool(username)
        valid_user = signed_in and any(
            isinstance(user, dict) and str(user.get("username") or "").strip().lower() == username
            for user in users
        )

        if not valid_user:
            self.send_response(403)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._set_cors_headers()
            self.send_header("Content-Length", str(len(b'{"error":"Authentication required"}')))
            self.end_headers()
            self.wfile.write(b'{"error":"Authentication required"}')
            return

        self._write_store(items, folders, users, session)
        self._send_json({"items": items, "folders": folders, "users": users, "session": session})

    def _read_store(self):
        try:
            payload = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        except (FileNotFoundError, json.JSONDecodeError):
            ensure_store()
            payload = {"items": [], "folders": DEFAULT_FOLDERS, "users": DEFAULT_USERS, "session": {"username": "", "displayName": "", "isLoggedIn": False}}

        if not isinstance(payload, dict):
            payload = {"items": [], "folders": DEFAULT_FOLDERS, "users": DEFAULT_USERS, "session": {"username": "", "displayName": "", "isLoggedIn": False}}

        items = payload.get("items", [])
        folders = payload.get("folders", DEFAULT_FOLDERS)
        users = payload.get("users", DEFAULT_USERS)
        session = payload.get("session", {"username": "", "displayName": "", "isLoggedIn": False})
        if isinstance(session, dict) and session.get("username") and session.get("username", "").lower() == "demo":
            session = {"username": "", "displayName": "", "isLoggedIn": False}

        return {
            "items": items if isinstance(items, list) else [],
            "folders": folders if isinstance(folders, list) else DEFAULT_FOLDERS,
            "users": users if isinstance(users, list) else DEFAULT_USERS,
            "session": session if isinstance(session, dict) else {"username": "", "displayName": "", "isLoggedIn": False},
        }

    def _write_store(self, items, folders, users=None, session=None) -> None:
        ensure_store()
        users = users if isinstance(users, list) else DEFAULT_USERS
        session = session if isinstance(session, dict) else {"username": "", "displayName": "", "isLoggedIn": False}

        clean_items = []
        for item in items:
            if not isinstance(item, dict):
                continue
            author = str(item.get("author") or item.get("createdBy") or item.get("updatedBy") or "Гость").strip() or "Гость"
            clean_items.append({
                "id": str(item.get("id") or f"memory-{len(clean_items) + 1}"),
                "image": item.get("image", ""),
                "title": item.get("title", "Новый момент"),
                "date": item.get("date", ""),
                "location": item.get("location", "Место, которое запомнилось"),
                "memory": item.get("memory", "Добавьте описание этого момента."),
                "folderId": item.get("folderId", ""),
                "author": author,
                "createdBy": str(item.get("createdBy") or author).strip() or author,
                "updatedBy": str(item.get("updatedBy") or author).strip() or author,
            })

        clean_folders = []
        for folder in folders:
            if not isinstance(folder, dict):
                continue
            folder_id = str(folder.get("id") or "")
            folder_name = str(folder.get("name") or "Новая папка").strip()
            if not folder_id or not folder_name:
                continue
            created_by = str(folder.get("createdBy") or folder.get("author") or "Гость").strip() or "Гость"
            updated_by = str(folder.get("updatedBy") or created_by).strip() or created_by
            clean_folders.append({
                "id": folder_id,
                "name": folder_name,
                "icon": str(folder.get("icon") or ""),
                "createdBy": created_by,
                "updatedBy": updated_by,
            })

        clean_users = []
        for user in users:
            if not isinstance(user, dict):
                continue
            username = str(user.get("username") or "").strip().lower()
            if username == "demo":
                continue
            password = str(user.get("password") or "").strip()
            display_name = str(user.get("displayName") or user.get("username") or username).strip() or username
            if username and password:
                clean_users.append({
                    "username": username,
                    "password": password,
                    "displayName": display_name,
                })

        if isinstance(session, dict) and session.get("username") and str(session.get("username")).strip().lower() == "demo":
            session = {"username": "", "displayName": "", "isLoggedIn": False}

        DATA_FILE.write_text(
            json.dumps(
                {
                    "items": clean_items,
                    "folders": clean_folders,
                    "users": clean_users,
                    "session": session,
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )

    def _send_json(self, payload) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self._set_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args, **kwargs):
        return


if __name__ == "__main__":
    port = 4173
    server = ThreadingHTTPServer(("0.0.0.0", port), MemoryHandler)
    print(f"Memory archive server running on http://localhost:{port}")
    server.serve_forever()
