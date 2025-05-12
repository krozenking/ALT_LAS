#!/bin/bash

# Beta ortamı için Kubernetes yapılandırmalarını uygulama betiği

# Namespace oluştur
kubectl apply -f namespace.yaml

# ConfigMap ve Secret oluştur
kubectl apply -f config.yaml

# Veritabanı oluştur
kubectl apply -f postgres.yaml

# Servisleri oluştur
kubectl apply -f archive-service.yaml
kubectl apply -f ai-orchestrator.yaml
kubectl apply -f segmentation-service.yaml
kubectl apply -f api-gateway.yaml

echo "Beta ortamı başarıyla dağıtıldı!"
echo "Tüm servislerin hazır olması için bekleyin..."

# Servislerin hazır olmasını bekle
kubectl -n atlas-beta rollout status deployment/archive-service
kubectl -n atlas-beta rollout status deployment/ai-orchestrator
kubectl -n atlas-beta rollout status deployment/segmentation-service
kubectl -n atlas-beta rollout status deployment/api-gateway

echo "Tüm servisler hazır!"
echo "API Gateway'e şu adresten erişebilirsiniz: https://beta-api.atlas.example.com"
