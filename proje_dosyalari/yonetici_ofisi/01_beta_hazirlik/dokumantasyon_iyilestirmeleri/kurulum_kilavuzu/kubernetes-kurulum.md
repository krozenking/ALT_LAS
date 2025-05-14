# Kubernetes Kurulum Kılavuzu

**Versiyon:** 2.0.0  
**Son Güncelleme:** 16 Haziran 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)

## 1. Genel Bakış

Bu kılavuz, ALT_LAS sisteminin Kubernetes üzerinde kurulumu için adım adım talimatlar içermektedir. ALT_LAS, Kubernetes üzerinde çalışan bir mikroservis mimarisi kullanır ve bu kılavuz, gerekli Kubernetes cluster'ının kurulumu, yapılandırılması ve ALT_LAS servislerinin dağıtımı için talimatlar sağlar.

## 2. Ön Koşullar

ALT_LAS'ı Kubernetes üzerinde kurmak için aşağıdaki ön koşulların sağlanması gerekmektedir:

### 2.1. Donanım Gereksinimleri

**Minimum Gereksinimler (Geliştirme Ortamı):**
- 4 vCPU
- 16 GB RAM
- 100 GB disk alanı

**Önerilen Gereksinimler (Üretim Ortamı):**
- 16 vCPU
- 64 GB RAM
- 500 GB disk alanı
- En az 3 node

### 2.2. Yazılım Gereksinimleri

- Kubernetes 1.24 veya daha yüksek
- Docker 20.10 veya daha yüksek
- Helm 3.8 veya daha yüksek
- kubectl 1.24 veya daha yüksek
- Git 2.30 veya daha yüksek

### 2.3. Ağ Gereksinimleri

- Kubernetes node'ları arasında iletişim için açık portlar (10250, 6443, 2379, 2380, 10251, 10252)
- Ingress Controller için açık portlar (80, 443)
- Servisler için açık portlar (8080, 8443, 5672, 15672, 9090, 9091, 3000, 9200, 5601)
- Kubernetes node'ları için statik IP adresleri
- DNS yapılandırması

## 3. Kubernetes Cluster Kurulumu

Bu bölümde, Kubernetes cluster'ının kurulumu için adım adım talimatlar verilmektedir. Kurulum için üç farklı seçenek sunulmaktadır: Managed Kubernetes hizmeti, kubeadm ile kurulum ve k3s ile kurulum.

### 3.1. Managed Kubernetes Hizmeti Kullanımı

Managed Kubernetes hizmeti, bulut sağlayıcıları tarafından sunulan ve Kubernetes cluster'ının yönetimini kolaylaştıran bir hizmettir. Bu bölümde, popüler bulut sağlayıcılarının Managed Kubernetes hizmetlerinin kullanımı için talimatlar verilmektedir.

#### 3.1.1. Amazon EKS

1. AWS CLI'yi kurun ve yapılandırın:

```bash
pip install awscli
aws configure
```

2. eksctl'yi kurun:

```bash
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
```

3. EKS cluster'ı oluşturun:

```bash
eksctl create cluster \
  --name alt-las-cluster \
  --version 1.24 \
  --region us-west-2 \
  --nodegroup-name alt-las-nodes \
  --node-type t3.xlarge \
  --nodes 3 \
  --nodes-min 3 \
  --nodes-max 6 \
  --with-oidc \
  --ssh-access \
  --ssh-public-key ~/.ssh/id_rsa.pub \
  --managed
```

4. Cluster'a erişimi doğrulayın:

```bash
kubectl get nodes
```

#### 3.1.2. Google GKE

1. Google Cloud SDK'yı kurun ve yapılandırın:

```bash
curl https://sdk.cloud.google.com | bash
gcloud init
```

2. GKE cluster'ı oluşturun:

```bash
gcloud container clusters create alt-las-cluster \
  --cluster-version=1.24 \
  --machine-type=e2-standard-4 \
  --num-nodes=3 \
  --region=us-central1 \
  --enable-autoscaling \
  --min-nodes=3 \
  --max-nodes=6 \
  --enable-network-policy \
  --enable-ip-alias
```

3. Cluster'a erişim için kimlik bilgilerini alın:

```bash
gcloud container clusters get-credentials alt-las-cluster --region=us-central1
```

4. Cluster'a erişimi doğrulayın:

```bash
kubectl get nodes
```

#### 3.1.3. Microsoft AKS

1. Azure CLI'yi kurun ve yapılandırın:

```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
az login
```

2. AKS cluster'ı oluşturun:

```bash
az aks create \
  --resource-group alt-las-rg \
  --name alt-las-cluster \
  --kubernetes-version 1.24 \
  --node-count 3 \
  --node-vm-size Standard_D4s_v3 \
  --enable-cluster-autoscaler \
  --min-count 3 \
  --max-count 6 \
  --network-plugin azure \
  --enable-addons monitoring \
  --generate-ssh-keys
```

3. Cluster'a erişim için kimlik bilgilerini alın:

```bash
az aks get-credentials --resource-group alt-las-rg --name alt-las-cluster
```

4. Cluster'a erişimi doğrulayın:

```bash
kubectl get nodes
```

### 3.2. kubeadm ile Kurulum

kubeadm, Kubernetes cluster'ı oluşturmak için kullanılan resmi bir araçtır. Bu bölümde, kubeadm kullanarak Kubernetes cluster'ı kurulumu için adım adım talimatlar verilmektedir.

#### 3.2.1. Ön Koşullar

Tüm node'larda aşağıdaki adımları uygulayın:

1. Swap'ı devre dışı bırakın:

```bash
sudo swapoff -a
sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
```

2. Gerekli paketleri kurun:

```bash
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
```

3. Docker'ı kurun:

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io
```

4. Docker'ı yapılandırın:

```bash
cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF

sudo systemctl enable docker
sudo systemctl daemon-reload
sudo systemctl restart docker
```

5. Kubernetes paketlerini kurun:

```bash
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
cat <<EOF | sudo tee /etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOF
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

6. Ağ ayarlarını yapılandırın:

```bash
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
sudo sysctl --system
```

#### 3.2.2. Master Node Kurulumu

Master node'da aşağıdaki adımları uygulayın:

1. Kubernetes cluster'ını başlatın:

```bash
sudo kubeadm init --pod-network-cidr=10.244.0.0/16 --kubernetes-version=1.24.0
```

2. kubeconfig dosyasını yapılandırın:

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

3. Pod ağını kurun (Calico):

```bash
kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml
```

4. Master node'un durumunu kontrol edin:

```bash
kubectl get nodes
```

5. Worker node'ları eklemek için join komutunu alın:

```bash
kubeadm token create --print-join-command
```

#### 3.2.3. Worker Node Kurulumu

Worker node'larda aşağıdaki adımı uygulayın:

1. Master node'dan alınan join komutunu çalıştırın:

```bash
sudo kubeadm join <master-ip>:6443 --token <token> --discovery-token-ca-cert-hash <hash>
```

2. Master node'da, worker node'ların durumunu kontrol edin:

```bash
kubectl get nodes
```

### 3.3. k3s ile Kurulum

k3s, hafif bir Kubernetes dağıtımıdır ve daha az kaynak gerektirir. Bu bölümde, k3s kullanarak Kubernetes cluster'ı kurulumu için adım adım talimatlar verilmektedir.

#### 3.3.1. Master Node Kurulumu

Master node'da aşağıdaki adımları uygulayın:

1. k3s'i kurun:

```bash
curl -sfL https://get.k3s.io | sh -
```

2. kubeconfig dosyasını yapılandırın:

```bash
mkdir -p $HOME/.kube
sudo cp /etc/rancher/k3s/k3s.yaml $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
export KUBECONFIG=$HOME/.kube/config
```

3. Master node'un durumunu kontrol edin:

```bash
kubectl get nodes
```

4. Worker node'ları eklemek için token'ı alın:

```bash
sudo cat /var/lib/rancher/k3s/server/node-token
```

#### 3.3.2. Worker Node Kurulumu

Worker node'larda aşağıdaki adımı uygulayın:

1. k3s agent'ı kurun:

```bash
curl -sfL https://get.k3s.io | K3S_URL=https://<master-ip>:6443 K3S_TOKEN=<token> sh -
```

2. Master node'da, worker node'ların durumunu kontrol edin:

```bash
kubectl get nodes
```

## 4. Kubernetes Cluster Yapılandırması

Bu bölümde, Kubernetes cluster'ının ALT_LAS için yapılandırılması için adım adım talimatlar verilmektedir.

### 4.1. Namespace Oluşturma

ALT_LAS için bir namespace oluşturun:

```bash
kubectl create namespace alt-las
```

### 4.2. Node Havuzları Oluşturma

ALT_LAS için farklı node havuzları oluşturun:

#### 4.2.1. Node Etiketleri

Node'ları etiketleyin:

```bash
# Genel node havuzu
kubectl label nodes <node1> <node2> node-pool=general-pool

# CPU-optimized node havuzu
kubectl label nodes <node3> <node4> node-pool=cpu-optimized-pool

# Memory-optimized node havuzu
kubectl label nodes <node5> <node6> node-pool=memory-optimized-pool
```

#### 4.2.2. Node Taint'leri

Node'lara taint ekleyin:

```bash
# CPU-optimized node havuzu
kubectl taint nodes <node3> <node4> cpu=high:NoSchedule

# Memory-optimized node havuzu
kubectl taint nodes <node5> <node6> memory=high:NoSchedule
```

### 4.3. Depolama Yapılandırması

ALT_LAS için depolama yapılandırması yapın:

#### 4.3.1. StorageClass Oluşturma

```bash
cat <<EOF | kubectl apply -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: alt-las-storage
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2
reclaimPolicy: Retain
allowVolumeExpansion: true
mountOptions:
  - debug
volumeBindingMode: Immediate
EOF
```

#### 4.3.2. PersistentVolumeClaim Oluşturma

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: alt-las-data
  namespace: alt-las
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: alt-las-storage
  resources:
    requests:
      storage: 100Gi
EOF
```

### 4.4. Ağ Yapılandırması

ALT_LAS için ağ yapılandırması yapın:

#### 4.4.1. Ingress Controller Kurulumu

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.replicaCount=2 \
  --set controller.nodeSelector."node-pool"=general-pool
```

#### 4.4.2. NetworkPolicy Oluşturma

```bash
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: alt-las-network-policy
  namespace: alt-las
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: alt-las
    - podSelector: {}
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: alt-las
    - podSelector: {}
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
    - podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 53
EOF
```

### 4.5. Servis Mesh Kurulumu

ALT_LAS için Istio servis mesh'i kurun:

```bash
curl -L https://istio.io/downloadIstio | sh -
cd istio-*
export PATH=$PWD/bin:$PATH
istioctl install --set profile=default -y
kubectl label namespace alt-las istio-injection=enabled
```

### 4.6. İzleme ve Günlük Kaydı Kurulumu

ALT_LAS için izleme ve günlük kaydı araçlarını kurun:

#### 4.6.1. Prometheus ve Grafana Kurulumu

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.podMonitorSelectorNilUsesHelmValues=false \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false
```

#### 4.6.2. EFK Stack Kurulumu

```bash
helm repo add elastic https://helm.elastic.co
helm repo update
helm install elasticsearch elastic/elasticsearch \
  --namespace logging \
  --create-namespace \
  --set replicas=3 \
  --set minimumMasterNodes=2
helm install kibana elastic/kibana \
  --namespace logging
helm install fluent-bit stable/fluent-bit \
  --namespace logging \
  --set backend.type=es \
  --set backend.es.host=elasticsearch-master
```

## 5. ALT_LAS Dağıtımı

Bu bölümde, ALT_LAS servislerinin Kubernetes üzerinde dağıtımı için adım adım talimatlar verilmektedir.

### 5.1. Helm Kurulumu

```bash
curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
```

### 5.2. ALT_LAS Helm Chart'ını Klonlama

```bash
git clone https://github.com/alt-las/helm-charts.git
cd helm-charts
```

### 5.3. Değerleri Yapılandırma

```bash
cp values.yaml custom-values.yaml
# custom-values.yaml dosyasını düzenleyin
```

### 5.4. ALT_LAS'ı Dağıtma

```bash
helm install alt-las ./alt-las -f custom-values.yaml --namespace alt-las
```

### 5.5. Dağıtımı Doğrulama

```bash
kubectl get pods -n alt-las
kubectl get services -n alt-las
kubectl get ingress -n alt-las
```

## 6. Sorun Giderme

Bu bölümde, Kubernetes kurulumu ve ALT_LAS dağıtımı sırasında karşılaşılabilecek yaygın sorunlar ve çözümleri açıklanmaktadır.

### 6.1. Kubernetes Kurulum Sorunları

#### 6.1.1. kubeadm init Hatası

**Sorun**: kubeadm init komutu başarısız oluyor.

**Çözüm**:
1. Swap'ın devre dışı bırakıldığından emin olun:
```bash
sudo swapoff -a
```

2. Docker'ın çalıştığından emin olun:
```bash
sudo systemctl status docker
```

3. kubeadm'i sıfırlayın ve tekrar deneyin:
```bash
sudo kubeadm reset
sudo kubeadm init --pod-network-cidr=10.244.0.0/16
```

#### 6.1.2. Node'lar NotReady Durumunda

**Sorun**: Node'lar NotReady durumunda kalıyor.

**Çözüm**:
1. Pod ağının doğru kurulduğundan emin olun:
```bash
kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml
```

2. kubelet'in çalıştığından emin olun:
```bash
sudo systemctl status kubelet
sudo systemctl restart kubelet
```

3. kubelet günlüklerini kontrol edin:
```bash
sudo journalctl -u kubelet
```

### 6.2. ALT_LAS Dağıtım Sorunları

#### 6.2.1. Pod'lar CrashLoopBackOff Durumunda

**Sorun**: Pod'lar CrashLoopBackOff durumunda kalıyor.

**Çözüm**:
1. Pod günlüklerini kontrol edin:
```bash
kubectl logs <pod-name> -n alt-las
```

2. Pod'un tanımını kontrol edin:
```bash
kubectl describe pod <pod-name> -n alt-las
```

3. Bağımlılıkların hazır olduğundan emin olun (veritabanı, mesaj kuyruğu vb.).

#### 6.2.2. Ingress Çalışmıyor

**Sorun**: Ingress üzerinden servislere erişilemiyor.

**Çözüm**:
1. Ingress Controller'ın çalıştığından emin olun:
```bash
kubectl get pods -n ingress-nginx
```

2. Ingress tanımını kontrol edin:
```bash
kubectl describe ingress -n alt-las
```

3. Servis ve endpoint'lerin doğru yapılandırıldığından emin olun:
```bash
kubectl get services -n alt-las
kubectl get endpoints -n alt-las
```

## 7. Kaynaklar

- [Kubernetes Dokümantasyonu](https://kubernetes.io/docs/)
- [kubeadm Kurulum Kılavuzu](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)
- [k3s Dokümantasyonu](https://rancher.com/docs/k3s/latest/en/)
- [Helm Dokümantasyonu](https://helm.sh/docs/)
- [Istio Dokümantasyonu](https://istio.io/latest/docs/)
- [Prometheus Dokümantasyonu](https://prometheus.io/docs/introduction/overview/)
- [Grafana Dokümantasyonu](https://grafana.com/docs/)
- [EFK Stack Dokümantasyonu](https://www.elastic.co/guide/index.html)
