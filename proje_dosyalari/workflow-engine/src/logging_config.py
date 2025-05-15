import sys
from loguru import logger

# Basic logging configuration
LOGGING_LEVEL = "INFO" # Can be overridden by environment variable
LOGGING_FORMAT = "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"

def setup_logging():
    """Configure Loguru logger."""
    logger.remove()
    logger.add(
        sys.stderr,
        level=LOGGING_LEVEL,
        format=LOGGING_FORMAT,
        colorize=True,
        backtrace=True,
        diagnose=True
    )
    # Add file logging (optional, can be configured via settings)
    # logger.add(
    #     "logs/workflow_engine_{time}.log",
    #     rotation="10 MB",
    #     retention="10 days",
    #     level=LOGGING_LEVEL,
    #     format=LOGGING_FORMAT,
    #     enqueue=True # For async logging
    # )
    logger.info("Logging configured.")

# You can also configure exception handling hooks here if needed

