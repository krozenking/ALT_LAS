# ---- Builder Stage ----
FROM python:3.10-slim AS builder

WORKDIR /app

# Install system dependencies required for building some Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    wget \
    curl \
    libopenblas-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file and install dependencies
COPY requirements.txt .
# Using --prefix=/install to install packages into a specific directory
# This makes it easier to copy only the installed packages to the final stage
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ---- Runner Stage ----
FROM python:3.10-slim

WORKDIR /app

# Create a non-root user for security
RUN groupadd -r appuser && useradd --no-log-init -r -g appuser appuser

# Copy installed Python packages from the builder stage
COPY --from=builder /install /usr/local

# Copy application code
COPY . .

# Create directories for models, cache, and logs, and set permissions
RUN mkdir -p /app/models /app/cache /app/logs && \
    chown -R appuser:appuser /app/models /app/cache /app/logs /app

# Set environment variables
ENV MODEL_DIR=/app/models
ENV CACHE_DIR=/app/cache
ENV LOG_LEVEL=INFO
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

# Switch to non-root user
USER appuser

EXPOSE 8000

# Run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

