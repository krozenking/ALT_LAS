#!/bin/bash
set -e

# Dağıtım Onayı Durumu parametreleri
APPROVAL_ID=$1
NAMESPACE="alt-las"

# Kullanım kontrolü
if [ -z "$APPROVAL_ID" ]; then
  echo "Kullanım: $0 <onay-id>"
  echo "Örnek: $0 20250522123456"
  exit 1
fi

echo "Dağıtım Onayı Durumu kontrol ediliyor:"
echo "Onay ID: $APPROVAL_ID"
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

# Dağıtım Onayı Durumu
echo "Dağıtım Onayı Durumu:"
kubectl get configmap ${APPROVAL_CM} -n ${NAMESPACE} -o jsonpath='{.data.approval-request\.yaml}' | grep "status:" | awk '{print "Durum: " $2}'

# Onaylar
echo "Onaylar:"
kubectl get configmap ${APPROVAL_CM} -n ${NAMESPACE} -o jsonpath='{.data.approval-request\.yaml}' | grep -A 4 "approvals:" | grep -v "approvals:"

# Kontroller
echo "Kontroller:"
kubectl get configmap ${APPROVAL_CM} -n ${NAMESPACE} -o jsonpath='{.data.approval-request\.yaml}' | grep -A 7 "checks:" | grep -v "checks:"

# Red Sebebi
REJECTION_REASON=$(kubectl get configmap ${APPROVAL_CM} -n ${NAMESPACE} -o jsonpath='{.data.approval-request\.yaml}' | grep "rejectionReason:" | awk -F'"' '{print $2}')
if [ ! -z "$REJECTION_REASON" ]; then
  echo "Red Sebebi: $REJECTION_REASON"
  kubectl get configmap ${APPROVAL_CM} -n ${NAMESPACE} -o jsonpath='{.data.approval-request\.yaml}' | grep "rejectedBy:" | awk '{print "Reddeden: " $2}'
  kubectl get configmap ${APPROVAL_CM} -n ${NAMESPACE} -o jsonpath='{.data.approval-request\.yaml}' | grep "rejectedAt:" | awk '{print "Red Tarihi: " $2}'
fi

echo "Dağıtım Onayı Durumu kontrolü tamamlandı."
