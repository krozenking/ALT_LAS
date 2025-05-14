FROM python:3.11-slim

WORKDIR /app

# Install build-essential for any C/C++ dependencies that might be needed by pip packages
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

COPY requirements.txt requirements.txt

# Create and activate virtual environment
RUN python3.11 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# Install dependencies within the virtual environment
RUN pip install --no-cache-dir -r requirements.txt

COPY ./src /app/src
COPY ./README.md /app/README.md

# Add a basic entrypoint or command (e.g., if using FastAPI with uvicorn)
# CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "80"]
EXPOSE 80

# Default command to keep container running if no app is started yet
CMD ["tail", "-f", "/dev/null"]
