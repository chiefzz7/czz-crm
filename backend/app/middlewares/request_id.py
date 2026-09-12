"""
CZZ CRM — Request ID Middleware
Injeta um UUID único em cada requisição para rastreamento distribuído.
"""

import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from loguru import logger


class RequestIDMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id

        with logger.contextualize(request_id=request_id):
            logger.info(
                "→ {method} {path}",
                method=request.method,
                path=request.url.path,
            )
            response = await call_next(request)
            logger.info(
                "← {method} {path} {status}",
                method=request.method,
                path=request.url.path,
                status=response.status_code,
            )

        response.headers["X-Request-ID"] = request_id
        return response
