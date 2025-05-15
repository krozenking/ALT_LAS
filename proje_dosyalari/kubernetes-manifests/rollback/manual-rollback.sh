#!/bin/bash
set -e

# Manuel Rollback parametreleri
SERVICE_NAME=$1
NAMESPACE="alt-las"
GRADUAL=${2:-false}

# Kullanım kontrolü
if [ -z "$SERVICE_NAME" ]; then
  echo "Kullanım: $0 <servis-adı> [kademeli]"
  echo "Örnek: $0 api-gateway true"
  exit 1
fi

echo "Manuel Rollback başlatılıyor: $SERVICE_NAME"
echo "Namespace: $NAMESPACE"
echo "Kademeli: $GRADUAL"

# Rollback onayı
read -p "Rollback işlemini onaylıyor musunuz? (e/h): " CONFIRM
if [ "$CONFIRM" != "e" ]; then
  echo "Rollback işlemi iptal edildi."
  exit 1
fi

# Yeni sürüm dağıtımını durdur
echo "Yeni sürüm dağıtımını durdurma..."
kubectl rollout pause deployment/${SERVICE_NAME}-v2 -n ${NAMESPACE}

# Kademeli Rollback
if [ "$GRADUAL" = "true" ]; then
  echo "Kademeli olarak trafiği eski sürüme yönlendirme..."
  
  # Önce %50 trafiği eski sürüme yönlendir
  echo "Trafiğin %50'sini eski sürüme yönlendirme..."
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
      weight: 50
    - destination:
        host: ${SERVICE_NAME}
        subset: v2
      weight: 50
EOF
  
  echo "5 dakika bekleniyor..."
  sleep 5m
fi

# Tüm trafiği eski sürüme yönlendir
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

# Yeni sürümü sıfıra indir
echo "Yeni sürümü sıfıra indirme..."
kubectl scale deployment ${SERVICE_NAME}-v2 -n ${NAMESPACE} --replicas=0

echo "Manuel rollback gerçekleştirildi: ${SERVICE_NAME}"

# Rollback doğrulama
echo "Rollback doğrulaması yapılıyor..."

# Servis erişilebilirliğini kontrol et
echo "Servis erişilebilirliğini kontrol etme..."
if kubectl exec -n ${NAMESPACE} deploy/curl -- curl -s http://${SERVICE_NAME}:${SERVICE_PORT}/health | grep -q "ok"; then
  echo "Servis erişilebilir."
else
  echo "UYARI: Servis erişilebilir değil!"
fi

# Hata oranını kontrol et
echo "Hata oranını kontrol etme..."
ERROR_RATE=$(kubectl exec -n ${NAMESPACE} deploy/prometheus -- curl -s http://localhost:9090/api/v1/query --data-urlencode 'query=sum(rate(http_requests_total{status=~"5..", app="'${SERVICE_NAME}'"}[5m])) / sum(rate(http_requests_total{app="'${SERVICE_NAME}'"}[5m]))' | jq -r '.data.result[0].value[1]')
if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
  echo "UYARI: Hata oranı hala yüksek: $ERROR_RATE"
else
  echo "Hata oranı normal: $ERROR_RATE"
fi

# Gecikme süresini kontrol et
echo "Gecikme süresini kontrol etme..."
LATENCY=$(kubectl exec -n ${NAMESPACE} deploy/prometheus -- curl -s http://localhost:9090/api/v1/query --data-urlencode 'query=histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{app="'${SERVICE_NAME}'"}[5m])) by (le))' | jq -r '.data.result[0].value[1]')
if (( $(echo "$LATENCY > 0.5" | bc -l) )); then
  echo "UYARI: Gecikme süresi hala yüksek: $LATENCY s"
else
  echo "Gecikme süresi normal: $LATENCY s"
fi

echo "Rollback işlemi tamamlandı."
