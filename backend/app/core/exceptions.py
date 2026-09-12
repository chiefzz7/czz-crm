"""
CZZ CRM — Custom HTTP Exceptions
Padroniza todas as respostas de erro da API.
Stack traces NUNCA expostos em produção.
"""

from fastapi import HTTPException, status


class CRMException(HTTPException):
    """Base exception para o CRM."""

    def __init__(self, status_code: int, detail: str, headers: dict | None = None):
        super().__init__(status_code=status_code, detail=detail, headers=headers)


# ── 400 ───────────────────────────────────────────────────────────────────────
class BadRequestError(CRMException):
    def __init__(self, detail: str = "Requisição inválida."):
        super().__init__(status.HTTP_400_BAD_REQUEST, detail)


class ValidationError(CRMException):
    def __init__(self, detail: str = "Dados inválidos."):
        super().__init__(status.HTTP_422_UNPROCESSABLE_ENTITY, detail)


# ── 401 ───────────────────────────────────────────────────────────────────────
class UnauthorizedError(CRMException):
    def __init__(self, detail: str = "Não autorizado."):
        super().__init__(
            status.HTTP_401_UNAUTHORIZED,
            detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class InvalidTokenError(UnauthorizedError):
    def __init__(self):
        super().__init__("Token inválido ou expirado.")


class InvalidCredentialsError(UnauthorizedError):
    def __init__(self):
        super().__init__("Credenciais inválidas.")


# ── 403 ───────────────────────────────────────────────────────────────────────
class ForbiddenError(CRMException):
    def __init__(self, detail: str = "Acesso negado."):
        super().__init__(status.HTTP_403_FORBIDDEN, detail)


# ── 404 ───────────────────────────────────────────────────────────────────────
class NotFoundError(CRMException):
    def __init__(self, resource: str = "Recurso"):
        super().__init__(status.HTTP_404_NOT_FOUND, f"{resource} não encontrado(a).")


# ── 409 ───────────────────────────────────────────────────────────────────────
class ConflictError(CRMException):
    def __init__(self, detail: str = "Conflito de dados."):
        super().__init__(status.HTTP_409_CONFLICT, detail)


# ── 429 ───────────────────────────────────────────────────────────────────────
class RateLimitError(CRMException):
    def __init__(self):
        super().__init__(status.HTTP_429_TOO_MANY_REQUESTS, "Muitas requisições. Tente novamente em instantes.")


# ── 500 ───────────────────────────────────────────────────────────────────────
class InternalServerError(CRMException):
    def __init__(self, detail: str = "Erro interno do servidor."):
        super().__init__(status.HTTP_500_INTERNAL_SERVER_ERROR, detail)
