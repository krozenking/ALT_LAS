#!/bin/bash
set -e

# Canary geri alma parametreleri
SERVICE_NAME=$1
NAMESPACE="alt-las"

# Kullanım kontrolü
if [ -z "$SERVICE_NAME" ]; then
  echo "Kullanım: $0 <servis-adı>"
  echo "Örnek: $0 api-gateway"
  exit 1
fi

echo "Canary dağıtım geri alınıyor: $SERVICE_NAME"
echo "Namespace: $NAMESPACE"

# Tüm trafiği eski sürüme yönlendir
echo "Tüm trafiği eski sürüme yönlendirme..."
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

# Yeni sürümü sıfıra indir
echo "Yeni sürümü sıfıra indirme..."
kubectl scale deployment ${SERVICE_NAME}-v2 -n ${NAMESPACE} --replicas=0

echo "Canary dağıtım geri alındı. Tüm trafik v1 sürümüne yönlendirildi."
