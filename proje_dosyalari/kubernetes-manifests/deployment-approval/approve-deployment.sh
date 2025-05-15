#!/bin/bash
set -e

# Dağıtım Onayı parametreleri
APPROVAL_ID=$1
ROLE=$2
NAMESPACE="alt-las"

# Kullanım kontrolü
if [ -z "$APPROVAL_ID" ] || [ -z "$ROLE" ]; then
  echo "Kullanım: $0 <onay-id> <rol>"
  echo "Örnek: $0 20250522123456 developer"
  exit 1
fi

echo "Dağıtım Onayı veriliyor:"
echo "Onay ID: $APPROVAL_ID"
echo "Rol: $ROLE"
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

# Onay verme
echo "Onay veriliyor..."
kubectl patch configmap ${APPROVAL_CM} \
  -n ${NAMESPACE} \
  --type=merge \
  -p "{\"data\":{\"approval-request.yaml\":\"# Dağıtım Onayı İsteği\\n\\n## Genel Bilgiler\\nservice: ${SERVICE_NAME}\\nenvironment: ${ENVIRONMENT}\\nversion: ${VERSION}\\nrequestedBy: $(whoami)\\nrequestedAt: $(date -Iseconds)\\n\\n## Onay Durumu\\nstatus: pending\\n\\n## Onaylar\\napprovals:\\n  developer: $([ \"$ROLE\" == \"developer\" ] && echo \"approved\" || echo \"pending\")\\n  qa: $([ \"$ROLE\" == \"qa\" ] && echo \"approved\" || echo \"pending\")\\n  devops: $([ \"$ROLE\" == \"devops\" ] && echo \"approved\" || echo \"pending\")\\n  manager: $([ \"$ROLE\" == \"manager\" ] && echo \"approved\" || echo \"pending\")\\n\\n## Kontroller\\nchecks:\\n  unit-tests: success\\n  integration-tests: success\\n  system-tests: pending\\n  code-quality: success\\n  security-scan: success\\n  performance-tests: pending\\n  compliance-check: pending\"}}"

echo "Onay verildi: $ROLE"

# Tüm onayların tamamlanıp tamamlanmadığını kontrol etme
DEVELOPER_APPROVAL=$(kubectl get configmap ${APPROVAL_CM} -n ${NAMESPACE} -o jsonpath='{.data.approval-request\.yaml}' | grep "developer:" | awk '{print $2}')
QA_APPROVAL=$(kubectl get configmap ${APPROVAL_CM} -n ${NAMESPACE} -o jsonpath='{.data.approval-request\.yaml}' | grep "qa:" | awk '{print $2}')
DEVOPS_APPROVAL=$(kubectl get configmap ${APPROVAL_CM} -n ${NAMESPACE} -o jsonpath='{.data.approval-request\.yaml}' | grep "devops:" | awk '{print $2}')
MANAGER_APPROVAL=$(kubectl get configmap ${APPROVAL_CM} -n ${NAMESPACE} -o jsonpath='{.data.approval-request\.yaml}' | grep "manager:" | awk '{print $2}')

# Ortama göre gerekli onayları kontrol etme
case $ENVIRONMENT in
  development)
    if [ "$DEVELOPER_APPROVAL" == "approved" ]; then
      ALL_APPROVED=true
    else
      ALL_APPROVED=false
    fi
    ;;
  testing)
    if [ "$DEVELOPER_APPROVAL" == "approved" ] && [ "$QA_APPROVAL" == "approved" ]; then
      ALL_APPROVED=true
    else
      ALL_APPROVED=false
    fi
    ;;
  staging)
    if [ "$DEVELOPER_APPROVAL" == "approved" ] && [ "$QA_APPROVAL" == "approved" ] && [ "$DEVOPS_APPROVAL" == "approved" ]; then
      ALL_APPROVED=true
    else
      ALL_APPROVED=false
    fi
    ;;
  production)
    if [ "$DEVELOPER_APPROVAL" == "approved" ] && [ "$QA_APPROVAL" == "approved" ] && [ "$DEVOPS_APPROVAL" == "approved" ] && [ "$MANAGER_APPROVAL" == "approved" ]; then
      ALL_APPROVED=true
    else
      ALL_APPROVED=false
    fi
    ;;
  *)
    ALL_APPROVED=false
    ;;
esac

if [ "$ALL_APPROVED" == "true" ]; then
  echo "Tüm onaylar tamamlandı. Dağıtım başlatılıyor..."
  
  # Dağıtım durumunu güncelleme
  kubectl patch configmap ${APPROVAL_CM} \
    -n ${NAMESPACE} \
    --type=merge \
    -p "{\"data\":{\"approval-request.yaml\":\"# Dağıtım Onayı İsteği\\n\\n## Genel Bilgiler\\nservice: ${SERVICE_NAME}\\nenvironment: ${ENVIRONMENT}\\nversion: ${VERSION}\\nrequestedBy: $(whoami)\\nrequestedAt: $(date -Iseconds)\\n\\n## Onay Durumu\\nstatus: approved\\n\\n## Onaylar\\napprovals:\\n  developer: ${DEVELOPER_APPROVAL}\\n  qa: ${QA_APPROVAL}\\n  devops: ${DEVOPS_APPROVAL}\\n  manager: ${MANAGER_APPROVAL}\\n\\n## Kontroller\\nchecks:\\n  unit-tests: success\\n  integration-tests: success\\n  system-tests: pending\\n  code-quality: success\\n  security-scan: success\\n  performance-tests: pending\\n  compliance-check: pending\"}}"
  
  # Dağıtımı başlatma
  echo "Dağıtım başlatılıyor: $SERVICE_NAME $VERSION -> $ENVIRONMENT"
  kubectl apply -f kubernetes-manifests/${SERVICE_NAME}/${ENVIRONMENT}
  
  # Dağıtım bildirimi gönderme
  echo "Dağıtım bildirimi gönderiliyor..."
  MESSAGE="ALT_LAS Dağıtım Onaylandı
Servis: $SERVICE_NAME
Ortam: $ENVIRONMENT
Sürüm: $VERSION
Onaylayan: $(whoami)
Tarih: $(date)
"

  # E-posta bildirimi
  if [ -x "$(command -v mail)" ]; then
    echo "$MESSAGE" | mail -s "ALT_LAS Dağıtım Onaylandı: $SERVICE_NAME" devops@altlas.com
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
  
  echo "Dağıtım başlatıldı."
else
  echo "Tüm onaylar henüz tamamlanmadı. Dağıtım beklemede."
fi

echo "Dağıtım Onayı işlemi tamamlandı."
