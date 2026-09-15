import json
import os
from http.server import BaseHTTPRequestHandler
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def json_response(handler, status, payload):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Access-Control-Allow-Origin", os.environ.get("CORS_ORIGIN", "*"))
    handler.send_header("Access-Control-Allow-Methods", "GET, PUT, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type, Accept")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def supabase_request(method, payload=None):
    supabase_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not supabase_url or not service_key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")

    url = f"{supabase_url}/rest/v1/memory_archive?id=eq.1"
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Accept": "application/json",
    }
    body = None
    if payload is not None:
        body = json.dumps({"id": 1, "payload": payload}, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json"
        headers["Prefer"] = "resolution=merge-duplicates,return=representation"

    request = Request(url, data=body, headers=headers, method=method)
    with urlopen(request, timeout=20) as response:
        raw = response.read().decode("utf-8")
        if not raw:
            return {}
        rows = json.loads(raw)
        if isinstance(rows, list) and rows:
            return rows[0].get("payload", {})
        return {}


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        json_response(self, 204, {})

    def do_GET(self):
        try:
            payload = supabase_request("GET")
            json_response(self, 200, payload)
        except (HTTPError, URLError, RuntimeError, ValueError) as error:
            json_response(self, 500, {"error": f"Storage unavailable: {error}"})

    def do_PUT(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
            if not isinstance(payload, dict):
                json_response(self, 400, {"error": "Payload must be an object"})
                return

            users = payload.get("users", [])
            session = payload.get("session", {})
            username = str(session.get("username") or "").strip().lower()
            valid_user = bool(session.get("isLoggedIn")) and bool(username) and any(
                isinstance(user, dict)
                and str(user.get("username") or "").strip().lower() == username
                for user in users
            )
            if not valid_user:
                json_response(self, 403, {"error": "Authentication required"})
                return

            saved = supabase_request("POST", payload)
            json_response(self, 200, saved or payload)
        except json.JSONDecodeError:
            json_response(self, 400, {"error": "Invalid JSON"})
        except (HTTPError, URLError, RuntimeError, ValueError) as error:
            json_response(self, 500, {"error": f"Storage unavailable: {error}"})

    def log_message(self, *_args):
        return
