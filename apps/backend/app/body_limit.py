"""Bound request streams before FastAPI parses multipart files or JSON bodies."""
from starlette.exceptions import HTTPException
from starlette.responses import JSONResponse


class RequestBodyTooLarge(HTTPException):
    def __init__(self):
        super().__init__(413, "Requête trop volumineuse")


class RequestBodyLimitMiddleware:
    def __init__(self, app, max_bytes: int):
        if max_bytes <= 0:
            raise ValueError("Request byte limit must be positive")
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        lengths = [value.strip() for name, value in scope.get("headers", []) if name.lower() == b"content-length"]
        if lengths:
            if len(lengths) != 1 or not lengths[0] or not lengths[0].isdigit():
                await JSONResponse({"detail": "Content-Length invalide"}, status_code=400)(scope, receive, send)
                return
            # Avoid parsing an attacker-supplied, arbitrarily large integer.
            value = lengths[0].lstrip(b"0") or b"0"
            if len(value) > len(str(self.max_bytes)) or int(value) > self.max_bytes:
                await JSONResponse({"detail": "Requête trop volumineuse"}, status_code=413)(scope, receive, send)
                return
        received = 0
        started = False

        async def limited_receive():
            nonlocal received
            message = await receive()
            if message["type"] == "http.request":
                received += len(message.get("body", b""))
                if received > self.max_bytes:
                    # Starlette cleans parser temporary files; FastAPI preserves HTTP 413.
                    raise RequestBodyTooLarge()
            return message

        async def tracked_send(message):
            nonlocal started
            if message["type"] == "http.response.start":
                started = True
            await send(message)

        try:
            await self.app(scope, limited_receive, tracked_send)
        except RequestBodyTooLarge:
            if started:
                raise
            await JSONResponse({"detail": "Requête trop volumineuse"}, status_code=413)(scope, receive, send)
