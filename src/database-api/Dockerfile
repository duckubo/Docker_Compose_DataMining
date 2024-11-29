# Dockerfile cho database API
FROM python:3.9-slim

WORKDIR /app/database-api

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python3", "app.py"]
