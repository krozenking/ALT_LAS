import logging
import sys
import json
from datetime import datetime

# Load the logging standard configuration (optional, can be hardcoded or read from env)
# For simplicity, we'll use values inspired by logging_standard.json
LOGGING_CONFIG = {
    "format": "json",
    "level": "INFO",
    "timestampFormat": "%Y-%m-%dT%H:%M:%S.%fZ", # ISO 8601 like, Python's default ISO is close
    "serviceContext": {
        "service": "segmentation-service",
        "version": "0.1.0" 
    }
}

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.utcfromtimestamp(record.created).strftime(LOGGING_CONFIG["timestampFormat"]),
            "level": record.levelname,
            "message": record.getMessage(),
            "service": LOGGING_CONFIG["serviceContext"]["service"],
            "version": LOGGING_CONFIG["serviceContext"]["version"],
        }
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        if hasattr(record, 'props') and record.props:
            log_record.update(record.props)
        return json.dumps(log_record)

def get_logger(name):
    logger = logging.getLogger(name)
    log_level_str = LOGGING_CONFIG["level"].upper()
    logger.setLevel(getattr(logging, log_level_str, logging.INFO))
    
    # Prevent duplicate handlers if logger is called multiple times
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = JsonFormatter()
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
    return logger

# Example usage (can be removed or kept for testing)
if __name__ == "__main__":
    logger = get_logger(__name__)
    logger.info("Segmentation service logger initialized.")
    logger.warning("This is a warning message.", extra={"props": {"custom_field": "custom_value"}})
    try:
        1 / 0
    except ZeroDivisionError:
        logger.error("Division by zero error", exc_info=True)

