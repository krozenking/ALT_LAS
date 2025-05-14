#!/bin/bash
set -e

# Metrik Toplama parametreleri
SERVICE_NAME=$1
ENVIRONMENT=$2
NAMESPACE="alt-las"

# Kullanım kontrolü
if [ -z "$SERVICE_NAME" ] || [ -z "$ENVIRONMENT" ]; then
  echo "Kullanım: $0 <servis-adı> <ortam>"
  echo "Örnek: $0 api-gateway production"
  exit 1
fi

echo "Metrik Toplama başlatılıyor:"
echo "Servis: $SERVICE_NAME"
echo "Ortam: $ENVIRONMENT"
echo "Namespace: $NAMESPACE"

# GitHub metrikleri toplama
echo "GitHub metrikleri toplanıyor..."
GITHUB_METRICS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/repos/altlas/$SERVICE_NAME/stats/contributors")
COMMIT_COUNT=$(echo $GITHUB_METRICS | jq -r 'map(.total) | add')
echo "Commit Sayısı: $COMMIT_COUNT"

PULL_REQUEST_METRICS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/repos/altlas/$SERVICE_NAME/pulls?state=all&per_page=100")
PULL_REQUEST_COUNT=$(echo $PULL_REQUEST_METRICS | jq -r 'length')
echo "Pull Request Sayısı: $PULL_REQUEST_COUNT"

ISSUE_METRICS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/repos/altlas/$SERVICE_NAME/issues?state=all&per_page=100")
ISSUE_COUNT=$(echo $ISSUE_METRICS | jq -r 'length')
echo "Issue Sayısı: $ISSUE_COUNT"

# Jenkins metrikleri toplama
echo "Jenkins metrikleri toplanıyor..."
JENKINS_METRICS=$(curl -s -u "$JENKINS_USER:$JENKINS_TOKEN" "$JENKINS_URL/job/$SERVICE_NAME-build/api/json")
BUILD_TIME=$(echo $JENKINS_METRICS | jq -r '.lastBuild.duration')
echo "Yapı Süresi: $BUILD_TIME ms"

TEST_TIME=$(echo $JENKINS_METRICS | jq -r '.lastBuild.actions[] | select(.testReport != null) | .testReport.duration')
echo "Test Süresi: $TEST_TIME ms"

SUCCESS_RATE=$(curl -s -u "$JENKINS_USER:$JENKINS_TOKEN" "$JENKINS_URL/job/$SERVICE_NAME-build/api/json?tree=builds[result]" | jq -r '.builds | map(select(.result == "SUCCESS")) | length / length * 100')
echo "Başarı Oranı: $SUCCESS_RATE%"

FAILURE_RATE=$(curl -s -u "$JENKINS_USER:$JENKINS_TOKEN" "$JENKINS_URL/job/$SERVICE_NAME-build/api/json?tree=builds[result]" | jq -r '.builds | map(select(.result == "FAILURE")) | length / length * 100')
echo "Başarısızlık Oranı: $FAILURE_RATE%"

# SonarQube metrikleri toplama
echo "SonarQube metrikleri toplanıyor..."
SONARQUBE_METRICS=$(curl -s -u "$SONARQUBE_TOKEN:" "$SONARQUBE_URL/api/measures/component?component=$SERVICE_NAME&metricKeys=coverage,code_smells,bugs,vulnerabilities,sqale_index")
TEST_COVERAGE=$(echo $SONARQUBE_METRICS | jq -r '.component.measures[] | select(.metric == "coverage") | .value')
echo "Test Kapsamı: $TEST_COVERAGE%"

CODE_QUALITY=$(echo $SONARQUBE_METRICS | jq -r '.component.measures[] | select(.metric == "code_smells") | .value')
echo "Kod Kalitesi (Code Smells): $CODE_QUALITY"

BUG_COUNT=$(echo $SONARQUBE_METRICS | jq -r '.component.measures[] | select(.metric == "bugs") | .value')
echo "Hata Sayısı: $BUG_COUNT"

VULNERABILITY_COUNT=$(echo $SONARQUBE_METRICS | jq -r '.component.measures[] | select(.metric == "vulnerabilities") | .value')
echo "Güvenlik Açığı Sayısı: $VULNERABILITY_COUNT"

TECHNICAL_DEBT=$(echo $SONARQUBE_METRICS | jq -r '.component.measures[] | select(.metric == "sqale_index") | .value')
echo "Teknik Borç: $TECHNICAL_DEBT dakika"

# Dağıtım metrikleri toplama
echo "Dağıtım metrikleri toplanıyor..."
DEPLOYMENT_METRICS=$(kubectl get deployments -n $NAMESPACE $SERVICE_NAME -o json)
DEPLOYMENT_FREQUENCY=$(kubectl get events -n $NAMESPACE --field-selector involvedObject.name=$SERVICE_NAME,involvedObject.kind=Deployment,reason=ScalingReplicaSet --no-headers | wc -l)
echo "Dağıtım Frekansı: $DEPLOYMENT_FREQUENCY"

DEPLOYMENT_SUCCESS_RATE=$(kubectl get events -n $NAMESPACE --field-selector involvedObject.name=$SERVICE_NAME,involvedObject.kind=Deployment,reason=ScalingReplicaSet,type=Normal --no-headers | wc -l | awk -v total=$DEPLOYMENT_FREQUENCY '{print $1 / total * 100}')
echo "Dağıtım Başarı Oranı: $DEPLOYMENT_SUCCESS_RATE%"

DEPLOYMENT_ROLLBACK_RATE=$(kubectl get events -n $NAMESPACE --field-selector involvedObject.name=$SERVICE_NAME,involvedObject.kind=Deployment,reason=DeploymentRollback --no-headers | wc -l | awk -v total=$DEPLOYMENT_FREQUENCY '{print $1 / total * 100}')
echo "Dağıtım Geri Alma Oranı: $DEPLOYMENT_ROLLBACK_RATE%"

# Prometheus'a metrik gönderme
echo "Prometheus'a metrik gönderiliyor..."
cat <<EOF | curl -s -X POST -H "Content-Type: text/plain" --data-binary @- http://prometheus:9090/metrics/job/cicd-metrics/instance/$SERVICE_NAME
# HELP build_time Yapı süresi
# TYPE build_time gauge
build_time{service="$SERVICE_NAME",environment="$ENVIRONMENT"} $BUILD_TIME

# HELP test_time Test süresi
# TYPE test_time gauge
test_time{service="$SERVICE_NAME",environment="$ENVIRONMENT"} $TEST_TIME

# HELP success_rate Başarı oranı
# TYPE success_rate gauge
success_rate{service="$SERVICE_NAME",environment="$ENVIRONMENT"} $SUCCESS_RATE

# HELP failure_rate Başarısızlık oranı
# TYPE failure_rate gauge
failure_rate{service="$SERVICE_NAME",environment="$ENVIRONMENT"} $FAILURE_RATE

# HELP test_coverage Test kapsamı
# TYPE test_coverage gauge
test_coverage{service="$SERVICE_NAME",environment="$ENVIRONMENT"} $TEST_COVERAGE

# HELP code_quality Kod kalitesi
# TYPE code_quality gauge
code_quality{service="$SERVICE_NAME",environment="$ENVIRONMENT"} $CODE_QUALITY

# HELP bug_count Hata sayısı
# TYPE bug_count gauge
bug_count{service="$SERVICE_NAME",environment="$ENVIRONMENT"} $BUG_COUNT

# HELP vulnerability_count Güvenlik açığı sayısı
# TYPE vulnerability_count gauge
vulnerability_count{service="$SERVICE_NAME",environment="$ENVIRONMENT"} $VULNERABILITY_COUNT

# HELP technical_debt Teknik borç
# TYPE technical_debt gauge
technical_debt{service="$SERVICE_NAME",environment="$ENVIRONMENT"} $TECHNICAL_DEBT

# HELP deployment_frequency Dağıtım frekansı
# TYPE deployment_frequency gauge
deployment_frequency{service="$SERVICE_NAME",environment="$ENVIRONMENT"} $DEPLOYMENT_FREQUENCY

# HELP deployment_success_rate Dağıtım başarı oranı
# TYPE deployment_success_rate gauge
deployment_success_rate{service="$SERVICE_NAME",environment="$ENVIRONMENT"} $DEPLOYMENT_SUCCESS_RATE

# HELP deployment_rollback_rate Dağıtım geri alma oranı
# TYPE deployment_rollback_rate gauge
deployment_rollback_rate{service="$SERVICE_NAME",environment="$ENVIRONMENT"} $DEPLOYMENT_ROLLBACK_RATE
EOF

echo "Metrik Toplama tamamlandı."
