# Node.js tabanlı çok aşamalı yapı

# Yapım aşaması
FROM node:18-alpine AS build

# Çalışma dizinini ayarla
WORKDIR /app

# Bağımlılıkları kopyala ve yükle
COPY package.json package-lock.json ./
RUN npm ci

# Kaynak kodları kopyala
COPY . .

# Uygulamayı derle
ARG VITE_ENV=production
RUN npm run build -- --mode ${VITE_ENV}

# Çalıştırma aşaması
FROM nginx:alpine AS runtime

# Nginx yapılandırmasını kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Derlenen uygulamayı Nginx'e kopyala
COPY --from=build /app/dist /usr/share/nginx/html

# Sağlık kontrolü
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

# Port 80'i dışa aç
EXPOSE 80

# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"]
