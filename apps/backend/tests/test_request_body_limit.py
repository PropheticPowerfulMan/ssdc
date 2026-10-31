from fastapi.testclient import TestClient
from app.main import app
from app.config import settings


def test_declared_oversized_body_rejected_before_authentication_or_parsing():
    client = TestClient(app)
    response = client.post("/api/v1/documents", headers={"Content-Length": str(settings().max_upload_bytes + 65537)}, files={"file": ("sample.txt", b"fictional", "text/plain")})
    assert response.status_code == 413


def test_oversized_stream_without_length_rejected_before_authentication():
    client = TestClient(app)
    boundary = "ssdc-boundary"
    def chunks():
        yield ("--" + boundary + '\r\nContent-Disposition: form-data; name="file"; filename="test.txt"\r\nContent-Type: text/plain\r\n\r\n').encode()
        for _ in range(162):
            yield b"x" * 65536
        yield ("\r\n--" + boundary + "--\r\n").encode()
    response = client.post("/api/v1/documents", headers={"Content-Type": "multipart/form-data; boundary=" + boundary}, content=chunks())
    assert response.status_code == 413


import asyncio
import pytest
from fastapi import FastAPI, Request
from app.body_limit import RequestBodyLimitMiddleware


@pytest.mark.parametrize("declared", [None, b"1"])
def test_actual_stream_count_cannot_be_bypassed_by_missing_or_small_length(declared):
    inner = FastAPI()
    @inner.post("/echo")
    async def echo(request: Request):
        body = await request.body()
        return {"length": len(body)}
    wrapped = RequestBodyLimitMiddleware(inner, max_bytes=128)
    messages = [{"type": "http.request", "body": b"a" * 90, "more_body": True}, {"type": "http.request", "body": b"b" * 90, "more_body": False}]
    sent = []
    async def receive():
        return messages.pop(0) if messages else {"type": "http.disconnect"}
    async def send(message):
        sent.append(message)
    headers = [(b"content-type", b"application/json")]
    if declared is not None:
        headers.append((b"content-length", declared))
    scope = {"type": "http", "asgi": {"version": "3.0"}, "http_version": "1.1", "method": "POST", "scheme": "http", "path": "/echo", "raw_path": b"/echo", "query_string": b"", "headers": headers, "client": ("test", 123), "server": ("test", 80), "root_path": ""}
    asyncio.run(wrapped(scope, receive, send))
    assert next(message["status"] for message in sent if message["type"] == "http.response.start") == 413


def test_early_declared_limit_does_not_read_body_and_small_body_still_works():
    inner = FastAPI()
    @inner.post("/echo")
    async def echo(request: Request):
        return {"length": len(await request.body())}
    wrapped = RequestBodyLimitMiddleware(inner, max_bytes=128)
    client = TestClient(wrapped)
    assert client.post("/echo", content=b"abc").json() == {"length": 3}
    assert client.post("/echo", headers={"Content-Length": "129"}, content=b"abc").status_code == 413
    assert client.post("/echo", headers={"Content-Length": "-1"}, content=b"abc").status_code == 400
