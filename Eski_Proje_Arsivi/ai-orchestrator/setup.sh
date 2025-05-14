#!/bin/bash

# Setup script for AI Orchestrator

# Create necessary directories
mkdir -p models cache logs

# Check if Python 3.10+ is installed
python3 --version | grep -q "Python 3.1" || {
    echo "Python 3.10+ is required. Please install it before continuing."
    exit 1
}

# Install dependencies
echo "Installing dependencies..."
pip3 install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
MODEL_DIR=./models
CACHE_DIR=./cache
LOG_LEVEL=INFO
USE_GPU=true
EOF
fi

echo "Setup completed successfully!"
echo "To start the AI Orchestrator, run: uvicorn src.main:app --reload"
echo "Or using Docker: docker-compose up -d"
