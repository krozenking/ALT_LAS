# GPU İstek Yönlendirme Katmanı için Dockerfile
FROM python:3.9-slim

# Çalışma dizinini ayarla
WORKDIR /app

# Bağımlılıkları kopyala ve yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama kodunu kopyala
COPY . .

# Uygulama portunu aç
EXPOSE 8000

# Uygulamayı başlat
CMD ["uvicorn", "api_app:app", "--host", "0.0.0.0", "--port", "8000"]
