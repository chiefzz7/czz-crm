"""
CZZ CRM — Structured Logging Configuration (Loguru)
Enterprise-grade: JSON in production, colorized in development.
"""

import sys
import io

# Fix Windows cp1252 encoding for emojis in log output
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

from loguru import logger
from .config import get_settings


def setup_logging() -> None:
    settings = get_settings()
    logger.remove()  # Remove default handler

    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )

    if settings.is_production:
        # JSON structured logs for log aggregators (Datadog, Grafana, etc.)
        logger.add(
            sys.stdout,
            format="{message}",
            level=settings.LOG_LEVEL,
            serialize=True,  # JSON output
        )
    else:
        logger.add(
            sys.stdout,
            format=log_format,
            level=settings.LOG_LEVEL,
            colorize=True,
        )

    # Always write to file with rotation
    logger.add(
        settings.LOG_FILE,
        format=log_format,
        level=settings.LOG_LEVEL,
        rotation="10 MB",
        retention="30 days",
        compression="gz",
        enqueue=True,  # Thread-safe async logging
    )

    logger.info(
        "Logging initialized",
        extra={"environment": settings.ENVIRONMENT, "level": settings.LOG_LEVEL},
    )
