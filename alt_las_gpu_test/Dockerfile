FROM nvidia/cuda:11.7.1-base-ubuntu20.04

# Temel paketleri kur
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Çalışma dizinini oluştur
WORKDIR /app

# Gerekli Python paketlerini kur
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Uygulama dosyalarını kopyala
COPY . .

# SSL'i devre dışı bırak
ENV WERKZEUG_RUN_MAIN=true
ENV FLASK_ENV=development
ENV FLASK_DEBUG=1
ENV FLASK_APP=app.py

# Uygulamayı HTTP kullanarak çalıştır
CMD ["python3", "-m", "flask", "run", "--host=0.0.0.0", "--port=8000", "--no-debugger", "--no-reload"]
