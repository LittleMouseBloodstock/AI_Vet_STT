# Use official Python runtime as a parent image
FROM python:3.11-slim

# Install system dependencies (ffmpeg for pydub)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Cloud Run expects the container to listen on PORT (default 8080)
# Uvicorn will listen on 0.0.0.0:8080
CMD exec uvicorn main:app --host 0.0.0.0 --port 8080
