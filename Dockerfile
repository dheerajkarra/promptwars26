# Use the official Python lightweight image
FROM python:3.11-slim

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Run pytest to automatically verify tests during build
# If tests fail here, the Docker image build stops and Cloud Run aborts the deployment!
RUN PYTHONPATH=/app pytest tests/

# Expose the port Cloud Run provides (default 8080)
EXPOSE 8080

# Command to run the application using uvicorn
CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}
