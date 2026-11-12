"""Simple in-memory sliding-window rate limiter (per-process)."""

from __future__ import annotations

import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import HTTPException, Request, status


class RateLimiter:
    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def hit(self, key: str, *, limit: int, window_seconds: int) -> None:
        now = time.monotonic()
        with self._lock:
            bucket = self._hits[key]
            threshold = now - window_seconds
            while bucket and bucket[0] < threshold:
                bucket.popleft()
            if len(bucket) >= limit:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests. Try again later.",
                    headers={"Retry-After": str(window_seconds)},
                )
            bucket.append(now)


limiter = RateLimiter()


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()[:64]
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def limit_auth(request: Request, *, action: str, limit: int = 8, window_seconds: int = 60) -> None:
    ip = client_ip(request)
    limiter.hit(f"auth:{action}:{ip}", limit=limit, window_seconds=window_seconds)


def limit_api(request: Request, *, action: str, limit: int = 60, window_seconds: int = 60) -> None:
    ip = client_ip(request)
    limiter.hit(f"api:{action}:{ip}", limit=limit, window_seconds=window_seconds)
