#!/bin/bash
set -e

# Dağıtım Reddi parametreleri
APPROVAL_ID=$1
ROLE=$2
REASON=$3
NAMESPACE="alt-las"

# Kullanım kontrolü
if [ -z "$APPROVAL_ID" ] || [ -z "$ROLE" ] || [ -z "$REASON" ]; then
  echo "Kullanım: $0 <onay-id> <rol> <sebep>"
  echo "Örnek: $0 20250522123456 developer 'Testler başarısız'"
  exit 1
fi

echo "Dağıtım Reddi yapılıyor:"
echo "Onay ID: $APPROVAL_ID"
echo "Rol: $ROLE"
echo "Sebep: $REASON"
echo "Namespace: $NAMESPACE"

# Dağıtım Onayı İsteği bilgilerini alma
APPROVAL_CM=$(kubectl get configmap -n ${NAMESPACE} -l app=deployment-approval | grep ${APPROVAL_ID} | awk '{print $1}')

if [ -z "$APPROVAL_CM" ]; then
  echo "Hata: Dağıtım Onayı İsteği bulunamadı: $APPROVAL_ID"
  exit 1
fi

echo "Dağıtım Onayı İsteği bulundu: $APPROVAL_CM"

# Dağıtım Onayı İsteği bilgilerini alma
SERVICE_NAME=$(kubectl get configmap ${APPROVAL_CM} -n ${NAMESPACE} -o jsonpath='{.metadata.labels.service}')
ENVIRONMENT=$(kubectl get configmap ${APPROVAL_CM} -n ${NAMESPACE} -o jsonpath='{.metadata.labels.environment}')
VERSION=$(kubectl get configmap ${APPROVAL_CM} -n ${NAMESPACE} -o jsonpath='{.metadata.labels.version}')

echo "Servis: $SERVICE_NAME"
echo "Ortam: $ENVIRONMENT"
echo "Sürüm: $VERSION"

# Rol kontrolü
case $ROLE in
  developer|qa|devops|manager)
    echo "Rol geçerli: $ROLE"
    ;;
  *)
    echo "Hata: Geçersiz rol: $ROLE"
    echo "Geçerli roller: developer, qa, devops, manager"
    exit 1
    ;;
esac

# Reddetme
echo "Reddetme işlemi yapılıyor..."
kubectl patch configmap ${APPROVAL_CM} \
  -n ${NAMESPACE} \
  --type=merge \
  -p "{\"data\":{\"approval-request.yaml\":\"# Dağıtım Onayı İsteği\\n\\n## Genel Bilgiler\\nservice: ${SERVICE_NAME}\\nenvironment: ${ENVIRONMENT}\\nversion: ${VERSION}\\nrequestedBy: $(whoami)\\nrequestedAt: $(date -Iseconds)\\n\\n## Onay Durumu\\nstatus: rejected\\n\\n## Onaylar\\napprovals:\\n  developer: $([ \"$ROLE\" == \"developer\" ] && echo \"rejected\" || echo \"pending\")\\n  qa: $([ \"$ROLE\" == \"qa\" ] && echo \"rejected\" || echo \"pending\")\\n  devops: $([ \"$ROLE\" == \"devops\" ] && echo \"rejected\" || echo \"pending\")\\n  manager: $([ \"$ROLE\" == \"manager\" ] && echo \"rejected\" || echo \"pending\")\\n\\n## Kontroller\\nchecks:\\n  unit-tests: success\\n  integration-tests: success\\n  system-tests: pending\\n  code-quality: success\\n  security-scan: success\\n  performance-tests: pending\\n  compliance-check: pending\\n\\n## Red Sebebi\\nrejectionReason: \\\"${REASON}\\\"\\nrejectedBy: ${ROLE}\\nrejectedAt: $(date -Iseconds)\"}}"

echo "Dağıtım reddedildi: $ROLE"

# Dağıtım reddi bildirimi gönderme
echo "Dağıtım reddi bildirimi gönderiliyor..."
MESSAGE="ALT_LAS Dağıtım Reddedildi
Servis: $SERVICE_NAME
Ortam: $ENVIRONMENT
Sürüm: $VERSION
Reddeden: $ROLE ($(whoami))
Sebep: $REASON
Tarih: $(date)
"

# E-posta bildirimi
if [ -x "$(command -v mail)" ]; then
  echo "$MESSAGE" | mail -s "ALT_LAS Dağıtım Reddedildi: $SERVICE_NAME" devops@altlas.com
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

echo "Dağıtım Reddi işlemi tamamlandı."
