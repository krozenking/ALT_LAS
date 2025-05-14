# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies if needed (e.g., for specific libraries)
# RUN apt-get update && apt-get install -y --no-install-recommends some-package && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd --create-home appuser
WORKDIR /home/appuser/app

# Copy the requirements file into the container
COPY --chown=appuser:appuser ./requirements.txt .

# Install any needed packages specified in requirements.txt
# Use a virtual environment
RUN python3 -m venv venv
ENV PATH="/home/appuser/app/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY --chown=appuser:appuser ./src ./src

# Change ownership of the app directory
USER appuser

# Make port 8001 available to the world outside this container (adjust if needed)
EXPOSE 8001

# Define environment variables (optional)
# ENV NAME World

# Run main.py when the container launches
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8001"]

