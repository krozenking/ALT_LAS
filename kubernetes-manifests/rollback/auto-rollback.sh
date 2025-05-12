#!/bin/bash
set -e

# Otomatik Rollback parametreleri
SERVICE_NAME=$1
NAMESPACE="alt-las"
INTERVAL=30s
DURATION=1h
ERROR_THRESHOLD=0.02
LATENCY_THRESHOLD=1.0

# Kullanım kontrolü
if [ -z "$SERVICE_NAME" ]; then
  echo "Kullanım: $0 <servis-adı> [süre]"
  echo "Örnek: $0 api-gateway 1h"
  exit 1
fi

if [ ! -z "$2" ]; then
  DURATION=$2
fi

echo "Otomatik Rollback izleme başlatılıyor: $SERVICE_NAME"
echo "Namespace: $NAMESPACE"
echo "İzleme aralığı: $INTERVAL"
echo "İzleme süresi: $DURATION"
echo "Hata eşiği: $ERROR_THRESHOLD"
echo "Gecikme eşiği: $LATENCY_THRESHOLD"

# İzleme başlangıç zamanı
START_TIME=$(date +%s)
END_TIME=$((START_TIME + $(echo $DURATION | sed 's/h/*3600/;s/m/*60/;s/s//;' | bc)))

# İzleme döngüsü
while [ $(date +%s) -lt $END_TIME ]; do
  echo "$(date) - Otomatik Rollback metrikleri izleniyor: ${SERVICE_NAME}"
  
  # Hata oranı
  ERROR_RATE=$(kubectl exec -n ${NAMESPACE} deploy/prometheus -- curl -s http://localhost:9090/api/v1/query --data-urlencode 'query=sum(rate(http_requests_total{status=~"5..", app="'${SERVICE_NAME}'"}[5m])) / sum(rate(http_requests_total{app="'${SERVICE_NAME}'"}[5m]))' | jq -r '.data.result[0].value[1]')
  echo "Hata oranı: $ERROR_RATE"
  
  # Gecikme süresi
  LATENCY=$(kubectl exec -n ${NAMESPACE} deploy/prometheus -- curl -s http://localhost:9090/api/v1/query --data-urlencode 'query=histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{app="'${SERVICE_NAME}'"}[5m])) by (le))' | jq -r '.data.result[0].value[1]')
  echo "Gecikme süresi (p95): $LATENCY s"
  
  # Hata kontrolü
  if (( $(echo "$ERROR_RATE > $ERROR_THRESHOLD" | bc -l) )); then
    echo "UYARI: Hata oranı çok yüksek: $ERROR_RATE. Otomatik rollback başlatılıyor..."
    
    # Rollback işlemi
    echo "Tüm trafiği eski sürüme yönlendirme..."
    kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ${SERVICE_NAME}
  namespace: ${NAMESPACE}
spec:
  hosts:
  - ${SERVICE_NAME}
  http:
  - route:
    - destination:
        host: ${SERVICE_NAME}
        subset: v1
      weight: 100
    - destination:
        host: ${SERVICE_NAME}
        subset: v2
      weight: 0
EOF
    
    echo "Yeni sürümü sıfıra indirme..."
    kubectl scale deployment ${SERVICE_NAME}-v2 -n ${NAMESPACE} --replicas=0
    
    echo "Otomatik rollback gerçekleştirildi: ${SERVICE_NAME}"
    exit 0
  fi
  
  if (( $(echo "$LATENCY > $LATENCY_THRESHOLD" | bc -l) )); then
    echo "UYARI: Gecikme süresi çok yüksek: $LATENCY s. Otomatik rollback başlatılıyor..."
    
    # Rollback işlemi
    echo "Tüm trafiği eski sürüme yönlendirme..."
    kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ${SERVICE_NAME}
  namespace: ${NAMESPACE}
spec:
  hosts:
  - ${SERVICE_NAME}
  http:
  - route:
    - destination:
        host: ${SERVICE_NAME}
        subset: v1
      weight: 100
    - destination:
        host: ${SERVICE_NAME}
        subset: v2
      weight: 0
EOF
    
    echo "Yeni sürümü sıfıra indirme..."
    kubectl scale deployment ${SERVICE_NAME}-v2 -n ${NAMESPACE} --replicas=0
    
    echo "Otomatik rollback gerçekleştirildi: ${SERVICE_NAME}"
    exit 0
  fi
  
  echo "---"
  sleep $INTERVAL
done

echo "Otomatik Rollback izleme tamamlandı. Herhangi bir sorun tespit edilmedi."
