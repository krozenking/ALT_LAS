"""
Language Resources for Enhanced Multilingual Support

This directory contains language resources for the enhanced language processor.
Resources are stored in YAML/JSON format for easy maintenance and updates.
"""

import os
import logging
from pathlib import Path

# Setup logging
logger = logging.getLogger(__name__)

# Create language resources directory
resources_dir = os.path.dirname(os.path.abspath(__file__))
os.makedirs(resources_dir, exist_ok=True)

logger.info(f"Language resources directory: {resources_dir}")
