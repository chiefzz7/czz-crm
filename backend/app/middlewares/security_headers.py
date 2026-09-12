"""
CZZ CRM — Security Headers Middleware
Injeta headers de segurança HTTP em todas as respostas.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from ..core.config import get_settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):

    # Rotas do Swagger — precisam de CSP permissivo para carregar assets do CDN
    _SWAGGER_PATHS = {"/docs", "/redoc", "/openapi.json"}

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        settings = get_settings()

        # Previne clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # Previne MIME sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Força HTTPS em produção
        if settings.is_production:
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"

        # XSS Protection (legacy browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions Policy
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

        # Content Security Policy
        # Em dev, rotas do Swagger precisam de CSP permissivo (CDN + inline scripts)
        is_swagger_route = request.url.path in self._SWAGGER_PATHS
        if not settings.is_production and is_swagger_route:
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; "
                "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "img-src 'self' data: https://fastapi.tiangolo.com; "
                "connect-src 'self';"
            )
        else:
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data:; "
                "connect-src 'self';"
            )

        return response
