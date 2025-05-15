#!/bin/bash
set -e

# Rollback bildirimi parametreleri
SERVICE_NAME=$1
ROLLBACK_TYPE=$2
REASON=$3
NAMESPACE="alt-las"

# Kullanım kontrolü
if [ -z "$SERVICE_NAME" ] || [ -z "$ROLLBACK_TYPE" ] || [ -z "$REASON" ]; then
  echo "Kullanım: $0 <servis-adı> <rollback-tipi> <sebep>"
  echo "Örnek: $0 api-gateway auto 'Yüksek hata oranı'"
  exit 1
fi

echo "Rollback bildirimi gönderiliyor: $SERVICE_NAME"
echo "Rollback tipi: $ROLLBACK_TYPE"
echo "Sebep: $REASON"
echo "Namespace: $NAMESPACE"

# Bildirim mesajı
MESSAGE="ALT_LAS Rollback Bildirimi
Servis: $SERVICE_NAME
Namespace: $NAMESPACE
Rollback Tipi: $ROLLBACK_TYPE
Sebep: $REASON
Tarih: $(date)
"

# Bildirim gönderme (e-posta)
if [ -x "$(command -v mail)" ]; then
  echo "$MESSAGE" | mail -s "ALT_LAS Rollback Bildirimi: $SERVICE_NAME" devops@altlas.com
  echo "E-posta bildirimi gönderildi."
else
  echo "E-posta bildirimi gönderilemedi. 'mail' komutu bulunamadı."
fi

# Bildirim gönderme (Slack)
if [ -x "$(command -v curl)" ] && [ ! -z "$SLACK_WEBHOOK_URL" ]; then
  curl -X POST -H 'Content-type: application/json' --data "{\"text\":\"$MESSAGE\"}" $SLACK_WEBHOOK_URL
  echo "Slack bildirimi gönderildi."
else
  echo "Slack bildirimi gönderilemedi. 'curl' komutu bulunamadı veya SLACK_WEBHOOK_URL tanımlanmadı."
fi

# Bildirim gönderme (log)
echo "$MESSAGE" > /tmp/rollback-notification-${SERVICE_NAME}-$(date +%Y%m%d%H%M%S).log
echo "Log bildirimi oluşturuldu: /tmp/rollback-notification-${SERVICE_NAME}-$(date +%Y%m%d%H%M%S).log"

# Kubernetes Event oluşturma
kubectl create event --namespace=${NAMESPACE} --type=Warning --reason=Rollback --message="$MESSAGE" --for=deployment/${SERVICE_NAME}
echo "Kubernetes Event oluşturuldu."
