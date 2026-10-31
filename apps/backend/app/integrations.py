import socket
import struct
from pathlib import Path
from app.config import settings


def scan(content: bytes):
    """ClamAV INSTREAM: fail closed on timeout, error or infected result."""
    cfg = settings()
    with socket.create_connection((cfg.clamav_host, cfg.clamav_port), timeout=20) as sock:
        sock.sendall(b"zINSTREAM\0")
        for start in range(0, len(content), 65536):
            chunk = content[start:start + 65536]
            sock.sendall(struct.pack("!I", len(chunk)) + chunk)
        sock.sendall(struct.pack("!I", 0))
        result = b""
        while not result.endswith(b"\0") and len(result) < 4096:
            chunk = sock.recv(4096)
            if not chunk:
                break
            result += chunk
        if result != b"stream: OK\0":
            raise ValueError("Malware scan rejected or unavailable")


def object_path(object_id):
    from uuid import UUID
    UUID(object_id)
    directory = Path(settings().storage_path)
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    return directory / object_id
