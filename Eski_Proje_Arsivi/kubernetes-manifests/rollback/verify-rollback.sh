#!/bin/bash
set -e

# Rollback doğrulama parametreleri
SERVICE_NAME=$1
NAMESPACE="alt-las"
SERVICE_PORT=$2

# Kullanım kontrolü
if [ -z "$SERVICE_NAME" ] || [ -z "$SERVICE_PORT" ]; then
  echo "Kullanım: $0 <servis-adı> <servis-portu>"
  echo "Örnek: $0 api-gateway 3000"
  exit 1
fi

echo "Rollback doğrulaması başlatılıyor: $SERVICE_NAME"
echo "Namespace: $NAMESPACE"
echo "Servis portu: $SERVICE_PORT"

# Servis erişilebilirliğini kontrol et
echo "Servis erişilebilirliğini kontrol etme..."
if kubectl exec -n ${NAMESPACE} deploy/curl -- curl -s http://${SERVICE_NAME}:${SERVICE_PORT}/health | grep -q "ok"; then
  echo "Servis erişilebilir."
else
  echo "UYARI: Servis erişilebilir değil!"
  exit 1
fi

# Hata oranını kontrol et
echo "Hata oranını kontrol etme..."
ERROR_RATE=$(kubectl exec -n ${NAMESPACE} deploy/prometheus -- curl -s http://localhost:9090/api/v1/query --data-urlencode 'query=sum(rate(http_requests_total{status=~"5..", app="'${SERVICE_NAME}'"}[5m])) / sum(rate(http_requests_total{app="'${SERVICE_NAME}'"}[5m]))' | jq -r '.data.result[0].value[1]')
if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
  echo "UYARI: Hata oranı yüksek: $ERROR_RATE"
  exit 1
else
  echo "Hata oranı normal: $ERROR_RATE"
fi

# Gecikme süresini kontrol et
echo "Gecikme süresini kontrol etme..."
LATENCY=$(kubectl exec -n ${NAMESPACE} deploy/prometheus -- curl -s http://localhost:9090/api/v1/query --data-urlencode 'query=histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{app="'${SERVICE_NAME}'"}[5m])) by (le))' | jq -r '.data.result[0].value[1]')
if (( $(echo "$LATENCY > 0.5" | bc -l) )); then
  echo "UYARI: Gecikme süresi yüksek: $LATENCY s"
  exit 1
else
  echo "Gecikme süresi normal: $LATENCY s"
fi

# Başarı oranını kontrol et
echo "Başarı oranını kontrol etme..."
SUCCESS_RATE=$(kubectl exec -n ${NAMESPACE} deploy/prometheus -- curl -s http://localhost:9090/api/v1/query --data-urlencode 'query=sum(rate(http_requests_total{status=~"2..", app="'${SERVICE_NAME}'"}[5m])) / sum(rate(http_requests_total{app="'${SERVICE_NAME}'"}[5m]))' | jq -r '.data.result[0].value[1]')
if (( $(echo "$SUCCESS_RATE < 0.99" | bc -l) )); then
  echo "UYARI: Başarı oranı düşük: $SUCCESS_RATE"
  exit 1
else
  echo "Başarı oranı normal: $SUCCESS_RATE"
fi

# CPU kullanımını kontrol et
echo "CPU kullanımını kontrol etme..."
CPU_USAGE=$(kubectl exec -n ${NAMESPACE} deploy/prometheus -- curl -s http://localhost:9090/api/v1/query --data-urlencode 'query=sum(rate(container_cpu_usage_seconds_total{container_name!="POD", pod=~"'${SERVICE_NAME}'-.*"}[5m])) by (pod)' | jq -r '.data.result[0].value[1]')
if (( $(echo "$CPU_USAGE > 0.8" | bc -l) )); then
  echo "UYARI: CPU kullanımı yüksek: $CPU_USAGE"
  exit 1
else
  echo "CPU kullanımı normal: $CPU_USAGE"
fi

# Bellek kullanımını kontrol et
echo "Bellek kullanımını kontrol etme..."
MEMORY_USAGE=$(kubectl exec -n ${NAMESPACE} deploy/prometheus -- curl -s http://localhost:9090/api/v1/query --data-urlencode 'query=sum(container_memory_usage_bytes{container_name!="POD", pod=~"'${SERVICE_NAME}'-.*"}) by (pod) / sum(container_spec_memory_limit_bytes{container_name!="POD", pod=~"'${SERVICE_NAME}'-.*"}) by (pod)' | jq -r '.data.result[0].value[1]')
if (( $(echo "$MEMORY_USAGE > 0.8" | bc -l) )); then
  echo "UYARI: Bellek kullanımı yüksek: $MEMORY_USAGE"
  exit 1
else
  echo "Bellek kullanımı normal: $MEMORY_USAGE"
fi

echo "Rollback doğrulaması başarılı. Servis normal çalışıyor."
