"""
Dockerfile for AI Orchestrator.

This Dockerfile builds a container image for the AI Orchestrator service.
"""

# Use Python 3.10 as base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    wget \
    curl \
    libopenblas-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directories for models and cache
RUN mkdir -p /app/models /app/cache /app/logs

# Set environment variables
ENV MODEL_DIR=/app/models
ENV CACHE_DIR=/app/cache
ENV LOG_LEVEL=INFO
ENV PORT=8000

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
