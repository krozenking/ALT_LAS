#!/bin/bash
set -e

# Istio sürümü
ISTIO_VERSION=1.17.2

# Istio indirme ve kurulum
echo "Istio $ISTIO_VERSION indiriliyor..."
curl -L https://istio.io/downloadIstio | ISTIO_VERSION=$ISTIO_VERSION sh -

# Istio dizinine geçiş
cd istio-$ISTIO_VERSION

# Istio komut satırı aracını PATH'e ekleme
export PATH=$PWD/bin:$PATH

# Istio namespace'ini oluşturma
echo "Istio namespace'i oluşturuluyor..."
kubectl apply -f ../kubernetes-manifests/service-mesh/istio-namespace.yaml

# Istio kurulumu
echo "Istio kuruluyor..."
istioctl install -f ../kubernetes-manifests/service-mesh/istio-operator.yaml -y

# Namespace'i Istio ile enjekte etme
echo "alt-las namespace'i Istio ile enjekte ediliyor..."
kubectl apply -f ../kubernetes-manifests/service-mesh/namespace-injection.yaml

# Servis mesh kaynakları oluşturma
echo "Servis mesh kaynakları oluşturuluyor..."
kubectl apply -f ../kubernetes-manifests/service-mesh/service-accounts.yaml
kubectl apply -f ../kubernetes-manifests/service-mesh/destination-rules.yaml
kubectl apply -f ../kubernetes-manifests/service-mesh/virtual-services.yaml
kubectl apply -f ../kubernetes-manifests/service-mesh/peer-authentication.yaml
kubectl apply -f ../kubernetes-manifests/service-mesh/authorization-policies.yaml
kubectl apply -f ../kubernetes-manifests/service-mesh/gateway.yaml

# Kiali kurulumu
echo "Kiali kuruluyor..."
kubectl apply -f ../kubernetes-manifests/service-mesh/kiali.yaml

# Jaeger kurulumu
echo "Jaeger kuruluyor..."
kubectl apply -f ../kubernetes-manifests/service-mesh/jaeger.yaml

echo "Istio kurulumu tamamlandı!"
echo "Kiali arayüzüne erişmek için: http://localhost:20001/kiali"
echo "Jaeger arayüzüne erişmek için: http://jaeger.alt-las.local"
