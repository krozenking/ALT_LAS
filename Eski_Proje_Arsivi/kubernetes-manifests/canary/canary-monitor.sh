#!/bin/bash
set -e

# Canary izleme parametreleri
SERVICE_NAME=$1
NAMESPACE="alt-las"
INTERVAL=30s
DURATION=1h

# Kullanım kontrolü
if [ -z "$SERVICE_NAME" ]; then
  echo "Kullanım: $0 <servis-adı> [süre]"
  echo "Örnek: $0 api-gateway 1h"
  exit 1
fi

if [ ! -z "$2" ]; then
  DURATION=$2
fi

echo "Canary dağıtım izleniyor: $SERVICE_NAME"
echo "Namespace: $NAMESPACE"
echo "İzleme aralığı: $INTERVAL"
echo "İzleme süresi: $DURATION"

# İzleme başlangıç zamanı
START_TIME=$(date +%s)
END_TIME=$((START_TIME + $(echo $DURATION | sed 's/h/*3600/;s/m/*60/;s/s//;' | bc)))

# İzleme döngüsü
while [ $(date +%s) -lt $END_TIME ]; do
  echo "$(date) - Canary dağıtım metrikleri:"
  
  # Hata oranı
  ERROR_RATE=$(kubectl exec -n ${NAMESPACE} deploy/prometheus -- curl -s http://localhost:9090/api/v1/query --data-urlencode 'query=sum(rate(http_requests_total{status=~"5..", app="'${SERVICE_NAME}'"}[5m])) / sum(rate(http_requests_total{app="'${SERVICE_NAME}'"}[5m]))' | jq -r '.data.result[0].value[1]')
  echo "Hata oranı: $ERROR_RATE"
  
  # Gecikme süresi
  LATENCY=$(kubectl exec -n ${NAMESPACE} deploy/prometheus -- curl -s http://localhost:9090/api/v1/query --data-urlencode 'query=histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{app="'${SERVICE_NAME}'"}[5m])) by (le))' | jq -r '.data.result[0].value[1]')
  echo "Gecikme süresi (p95): $LATENCY s"
  
  # Başarı oranı
  SUCCESS_RATE=$(kubectl exec -n ${NAMESPACE} deploy/prometheus -- curl -s http://localhost:9090/api/v1/query --data-urlencode 'query=sum(rate(http_requests_total{status=~"2..", app="'${SERVICE_NAME}'"}[5m])) / sum(rate(http_requests_total{app="'${SERVICE_NAME}'"}[5m]))' | jq -r '.data.result[0].value[1]')
  echo "Başarı oranı: $SUCCESS_RATE"
  
  # CPU kullanımı
  CPU_USAGE=$(kubectl exec -n ${NAMESPACE} deploy/prometheus -- curl -s http://localhost:9090/api/v1/query --data-urlencode 'query=sum(rate(container_cpu_usage_seconds_total{container_name!="POD", pod=~"'${SERVICE_NAME}'-v2.*"}[5m])) by (pod)' | jq -r '.data.result[0].value[1]')
  echo "CPU kullanımı: $CPU_USAGE"
  
  # Bellek kullanımı
  MEMORY_USAGE=$(kubectl exec -n ${NAMESPACE} deploy/prometheus -- curl -s http://localhost:9090/api/v1/query --data-urlencode 'query=sum(container_memory_usage_bytes{container_name!="POD", pod=~"'${SERVICE_NAME}'-v2.*"}) by (pod) / sum(container_spec_memory_limit_bytes{container_name!="POD", pod=~"'${SERVICE_NAME}'-v2.*"}) by (pod)' | jq -r '.data.result[0].value[1]')
  echo "Bellek kullanımı: $MEMORY_USAGE"
  
  # Trafik dağılımı
  V1_WEIGHT=$(kubectl get virtualservice ${SERVICE_NAME} -n ${NAMESPACE} -o jsonpath='{.spec.http[0].route[0].weight}')
  V2_WEIGHT=$(kubectl get virtualservice ${SERVICE_NAME} -n ${NAMESPACE} -o jsonpath='{.spec.http[0].route[1].weight}')
  echo "Trafik dağılımı: v1: $V1_WEIGHT%, v2: $V2_WEIGHT%"
  
  # Hata kontrolü
  if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
    echo "UYARI: Hata oranı çok yüksek: $ERROR_RATE. Canary dağıtımı geri alınmalı."
  fi
  
  if (( $(echo "$LATENCY > 0.5" | bc -l) )); then
    echo "UYARI: Gecikme süresi çok yüksek: $LATENCY s. Canary dağıtımı geri alınmalı."
  fi
  
  echo "---"
  sleep $INTERVAL
done

echo "Canary dağıtım izleme tamamlandı."
