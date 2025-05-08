# ---- Builder Stage ----
FROM python:3.10-slim AS builder

WORKDIR /app

# Copy requirements file
COPY requirements_updated.txt .

# Install dependencies into a specific directory for easy copying
RUN pip install --no-cache-dir --prefix=/install -r requirements_updated.txt

# ---- Runner Stage ----
FROM python:3.10-slim

WORKDIR /app

# Create a non-root user for security
RUN groupadd -r appuser && useradd --no-log-init -r -g appuser appuser

# Copy installed Python packages from the builder stage
COPY --from=builder /install /usr/local

# Copy application code
# Ensure that only necessary files are copied, consider .dockerignore
COPY . .

# Create logs directory and set permissions
RUN mkdir -p /app/logs && \
    chown -R appuser:appuser /app/logs /app

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

