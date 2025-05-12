#!/bin/bash
set -e

# Dağıtım Onayı İsteği parametreleri
SERVICE_NAME=$1
ENVIRONMENT=$2
VERSION=$3
NAMESPACE="alt-las"

# Kullanım kontrolü
if [ -z "$SERVICE_NAME" ] || [ -z "$ENVIRONMENT" ] || [ -z "$VERSION" ]; then
  echo "Kullanım: $0 <servis-adı> <ortam> <sürüm>"
  echo "Örnek: $0 api-gateway production v1.0.0"
  exit 1
fi

echo "Dağıtım Onayı İsteği başlatılıyor:"
echo "Servis: $SERVICE_NAME"
echo "Ortam: $ENVIRONMENT"
echo "Sürüm: $VERSION"
echo "Namespace: $NAMESPACE"

# Dağıtım Onayı İsteği oluşturma
APPROVAL_ID=$(date +%Y%m%d%H%M%S)
APPROVAL_FILE="/tmp/deployment-approval-${SERVICE_NAME}-${ENVIRONMENT}-${VERSION}-${APPROVAL_ID}.yaml"

cat > $APPROVAL_FILE <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: deployment-approval-${SERVICE_NAME}-${ENVIRONMENT}-${VERSION}-${APPROVAL_ID}
  namespace: ${NAMESPACE}
  labels:
    app: deployment-approval
    service: ${SERVICE_NAME}
    environment: ${ENVIRONMENT}
    version: ${VERSION}
data:
  approval-request.yaml: |
    # Dağıtım Onayı İsteği
    
    ## Genel Bilgiler
    service: ${SERVICE_NAME}
    environment: ${ENVIRONMENT}
    version: ${VERSION}
    requestedBy: $(whoami)
    requestedAt: $(date -Iseconds)
    
    ## Onay Durumu
    status: pending
    
    ## Onaylar
    approvals:
      developer: pending
      qa: pending
      devops: pending
      manager: pending
    
    ## Kontroller
    checks:
      unit-tests: pending
      integration-tests: pending
      system-tests: pending
      code-quality: pending
      security-scan: pending
      performance-tests: pending
      compliance-check: pending
EOF

# Dağıtım Onayı İsteği uygulama
kubectl apply -f $APPROVAL_FILE

echo "Dağıtım Onayı İsteği oluşturuldu: $APPROVAL_ID"
echo "Dağıtım Onayı İsteği dosyası: $APPROVAL_FILE"

# Dağıtım öncesi kontrolleri çalıştırma
echo "Dağıtım öncesi kontrolleri çalıştırma..."

# Kod Kalitesi Kontrolü
echo "Kod kalitesi kontrolü çalıştırılıyor..."
if npm run lint && npm run sonar; then
  kubectl patch configmap deployment-approval-${SERVICE_NAME}-${ENVIRONMENT}-${VERSION}-${APPROVAL_ID} \
    -n ${NAMESPACE} \
    --type=merge \
    -p '{"data":{"approval-request.yaml":"# Dağıtım Onayı İsteği\n\n## Genel Bilgiler\nservice: '${SERVICE_NAME}'\nenvironment: '${ENVIRONMENT}'\nversion: '${VERSION}'\nrequestedBy: '$(whoami)'\nrequestedAt: '$(date -Iseconds)'\n\n## Onay Durumu\nstatus: pending\n\n## Onaylar\napprovals:\n  developer: pending\n  qa: pending\n  devops: pending\n  manager: pending\n\n## Kontroller\nchecks:\n  unit-tests: pending\n  integration-tests: pending\n  system-tests: pending\n  code-quality: success\n  security-scan: pending\n  performance-tests: pending\n  compliance-check: pending"}}'
  echo "Kod kalitesi kontrolü başarılı."
else
  kubectl patch configmap deployment-approval-${SERVICE_NAME}-${ENVIRONMENT}-${VERSION}-${APPROVAL_ID} \
    -n ${NAMESPACE} \
    --type=merge \
    -p '{"data":{"approval-request.yaml":"# Dağıtım Onayı İsteği\n\n## Genel Bilgiler\nservice: '${SERVICE_NAME}'\nenvironment: '${ENVIRONMENT}'\nversion: '${VERSION}'\nrequestedBy: '$(whoami)'\nrequestedAt: '$(date -Iseconds)'\n\n## Onay Durumu\nstatus: pending\n\n## Onaylar\napprovals:\n  developer: pending\n  qa: pending\n  devops: pending\n  manager: pending\n\n## Kontroller\nchecks:\n  unit-tests: pending\n  integration-tests: pending\n  system-tests: pending\n  code-quality: failed\n  security-scan: pending\n  performance-tests: pending\n  compliance-check: pending"}}'
  echo "Kod kalitesi kontrolü başarısız."
  exit 1
fi

# Güvenlik Taraması
echo "Güvenlik taraması çalıştırılıyor..."
if npm run security-scan; then
  kubectl patch configmap deployment-approval-${SERVICE_NAME}-${ENVIRONMENT}-${VERSION}-${APPROVAL_ID} \
    -n ${NAMESPACE} \
    --type=merge \
    -p '{"data":{"approval-request.yaml":"# Dağıtım Onayı İsteği\n\n## Genel Bilgiler\nservice: '${SERVICE_NAME}'\nenvironment: '${ENVIRONMENT}'\nversion: '${VERSION}'\nrequestedBy: '$(whoami)'\nrequestedAt: '$(date -Iseconds)'\n\n## Onay Durumu\nstatus: pending\n\n## Onaylar\napprovals:\n  developer: pending\n  qa: pending\n  devops: pending\n  manager: pending\n\n## Kontroller\nchecks:\n  unit-tests: pending\n  integration-tests: pending\n  system-tests: pending\n  code-quality: success\n  security-scan: success\n  performance-tests: pending\n  compliance-check: pending"}}'
  echo "Güvenlik taraması başarılı."
else
  kubectl patch configmap deployment-approval-${SERVICE_NAME}-${ENVIRONMENT}-${VERSION}-${APPROVAL_ID} \
    -n ${NAMESPACE} \
    --type=merge \
    -p '{"data":{"approval-request.yaml":"# Dağıtım Onayı İsteği\n\n## Genel Bilgiler\nservice: '${SERVICE_NAME}'\nenvironment: '${ENVIRONMENT}'\nversion: '${VERSION}'\nrequestedBy: '$(whoami)'\nrequestedAt: '$(date -Iseconds)'\n\n## Onay Durumu\nstatus: pending\n\n## Onaylar\napprovals:\n  developer: pending\n  qa: pending\n  devops: pending\n  manager: pending\n\n## Kontroller\nchecks:\n  unit-tests: pending\n  integration-tests: pending\n  system-tests: pending\n  code-quality: success\n  security-scan: failed\n  performance-tests: pending\n  compliance-check: pending"}}'
  echo "Güvenlik taraması başarısız."
  exit 1
fi

# Test Kontrolü
echo "Test kontrolü çalıştırılıyor..."
if npm test && npm run test:integration; then
  kubectl patch configmap deployment-approval-${SERVICE_NAME}-${ENVIRONMENT}-${VERSION}-${APPROVAL_ID} \
    -n ${NAMESPACE} \
    --type=merge \
    -p '{"data":{"approval-request.yaml":"# Dağıtım Onayı İsteği\n\n## Genel Bilgiler\nservice: '${SERVICE_NAME}'\nenvironment: '${ENVIRONMENT}'\nversion: '${VERSION}'\nrequestedBy: '$(whoami)'\nrequestedAt: '$(date -Iseconds)'\n\n## Onay Durumu\nstatus: pending\n\n## Onaylar\napprovals:\n  developer: pending\n  qa: pending\n  devops: pending\n  manager: pending\n\n## Kontroller\nchecks:\n  unit-tests: success\n  integration-tests: success\n  system-tests: pending\n  code-quality: success\n  security-scan: success\n  performance-tests: pending\n  compliance-check: pending"}}'
  echo "Test kontrolü başarılı."
else
  kubectl patch configmap deployment-approval-${SERVICE_NAME}-${ENVIRONMENT}-${VERSION}-${APPROVAL_ID} \
    -n ${NAMESPACE} \
    --type=merge \
    -p '{"data":{"approval-request.yaml":"# Dağıtım Onayı İsteği\n\n## Genel Bilgiler\nservice: '${SERVICE_NAME}'\nenvironment: '${ENVIRONMENT}'\nversion: '${VERSION}'\nrequestedBy: '$(whoami)'\nrequestedAt: '$(date -Iseconds)'\n\n## Onay Durumu\nstatus: pending\n\n## Onaylar\napprovals:\n  developer: pending\n  qa: pending\n  devops: pending\n  manager: pending\n\n## Kontroller\nchecks:\n  unit-tests: failed\n  integration-tests: failed\n  system-tests: pending\n  code-quality: success\n  security-scan: success\n  performance-tests: pending\n  compliance-check: pending"}}'
  echo "Test kontrolü başarısız."
  exit 1
fi

echo "Dağıtım öncesi kontroller tamamlandı."
echo "Dağıtım Onayı İsteği onay bekliyor."

# Onay bildirimi gönderme
echo "Onay bildirimi gönderiliyor..."
APPROVAL_URL="https://altlas.com/deployment-approvals/${APPROVAL_ID}"
MESSAGE="ALT_LAS Dağıtım Onayı İsteği
Servis: $SERVICE_NAME
Ortam: $ENVIRONMENT
Sürüm: $VERSION
İsteyen: $(whoami)
Tarih: $(date)
Onay URL: $APPROVAL_URL
"

# E-posta bildirimi
if [ -x "$(command -v mail)" ]; then
  echo "$MESSAGE" | mail -s "ALT_LAS Dağıtım Onayı İsteği: $SERVICE_NAME" devops@altlas.com
  echo "E-posta bildirimi gönderildi."
else
  echo "E-posta bildirimi gönderilemedi. 'mail' komutu bulunamadı."
fi

# Slack bildirimi
if [ -x "$(command -v curl)" ] && [ ! -z "$SLACK_WEBHOOK_URL" ]; then
  curl -X POST -H 'Content-type: application/json' --data "{\"text\":\"$MESSAGE\"}" $SLACK_WEBHOOK_URL
  echo "Slack bildirimi gönderildi."
else
  echo "Slack bildirimi gönderilemedi. 'curl' komutu bulunamadı veya SLACK_WEBHOOK_URL tanımlanmadı."
fi

echo "Dağıtım Onayı İsteği tamamlandı: $APPROVAL_ID"
