#!/bin/bash
set -e

# Canary dağıtım parametreleri
SERVICE_NAME=$1
NAMESPACE="alt-las"
INITIAL_WEIGHT=10
STEP_WEIGHT=20
INTERVAL=15m
MAX_WEIGHT=100

# Kullanım kontrolü
if [ -z "$SERVICE_NAME" ]; then
  echo "Kullanım: $0 <servis-adı>"
  echo "Örnek: $0 api-gateway"
  exit 1
fi

echo "Canary dağıtım başlatılıyor: $SERVICE_NAME"
echo "Namespace: $NAMESPACE"
echo "Başlangıç ağırlığı: $INITIAL_WEIGHT%"
echo "Adım ağırlığı: $STEP_WEIGHT%"
echo "Adım aralığı: $INTERVAL"

# Canary dağıtım kaynağını uygula
echo "Canary dağıtım kaynağını uygulama..."
kubectl apply -f ${SERVICE_NAME}-canary.yaml

# VirtualService'i güncelle
echo "VirtualService'i başlangıç ağırlığı ile güncelleme..."
cat <<EOF | kubectl apply -f -
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
      weight: $((100 - $INITIAL_WEIGHT))
    - destination:
        host: ${SERVICE_NAME}
        subset: v2
      weight: ${INITIAL_WEIGHT}
EOF

# Canary dağıtım metriklerini izle
echo "Canary dağıtım metriklerini izleme..."
echo "Prometheus sorgusu: sum(rate(http_requests_total{status=~\"5..\", app=\"${SERVICE_NAME}\"}[5m])) / sum(rate(http_requests_total{app=\"${SERVICE_NAME}\"}[5m]))"

# Kademeli olarak trafiği artır
CURRENT_WEIGHT=$INITIAL_WEIGHT
while [ $CURRENT_WEIGHT -lt $MAX_WEIGHT ]; do
  echo "Bekleniyor: $INTERVAL"
  sleep $INTERVAL
  
  # Hata oranını kontrol et
  ERROR_RATE=$(kubectl exec -n ${NAMESPACE} deploy/prometheus -- curl -s http://localhost:9090/api/v1/query --data-urlencode 'query=sum(rate(http_requests_total{status=~"5..", app="'${SERVICE_NAME}'"}[5m])) / sum(rate(http_requests_total{app="'${SERVICE_NAME}'"}[5m]))' | jq -r '.data.result[0].value[1]')
  
  if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
    echo "Hata oranı çok yüksek: $ERROR_RATE. Canary dağıtımı geri alınıyor..."
    
    # Tüm trafiği eski sürüme yönlendir
    cat <<EOF | kubectl apply -f -
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
    
    echo "Canary dağıtımı geri alındı."
    exit 1
  fi
  
  # Trafiği artır
  CURRENT_WEIGHT=$((CURRENT_WEIGHT + STEP_WEIGHT))
  if [ $CURRENT_WEIGHT -gt $MAX_WEIGHT ]; then
    CURRENT_WEIGHT=$MAX_WEIGHT
  fi
  
  echo "Trafiği artırma: v2 sürümü için $CURRENT_WEIGHT%"
  
  # VirtualService'i güncelle
  cat <<EOF | kubectl apply -f -
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
      weight: $((100 - $CURRENT_WEIGHT))
    - destination:
        host: ${SERVICE_NAME}
        subset: v2
      weight: ${CURRENT_WEIGHT}
EOF
done

echo "Canary dağıtım tamamlandı. Tüm trafik v2 sürümüne yönlendirildi."

# Eski sürümü kaldır
echo "Eski sürümü kaldırma..."
kubectl scale deployment ${SERVICE_NAME} -n ${NAMESPACE} --replicas=0

echo "Canary dağıtım başarıyla tamamlandı!"
