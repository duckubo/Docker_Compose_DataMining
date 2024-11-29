# Dockerfile cho database API
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
# Sao chép tệp cấu hình GML
COPY ../config/config.gml /app/config.gml  

CMD ["python", "app.py"]
