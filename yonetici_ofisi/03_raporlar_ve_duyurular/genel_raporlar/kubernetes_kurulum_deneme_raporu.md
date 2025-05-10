# Yerel Kubernetes Ortamı Kurulum Denemesi Raporu

**Tarih:** 10 Mayıs 2025
**Hazırlayan:** Yönetici
**Konu:** Yerel Kubernetes Ortamı Kurulum Denemeleri ve Karşılaşılan Sorunlar

## 1. Genel Bakış

Bu belge, ALT_LAS projesi için yerel bir Kubernetes ortamı kurma denemelerini ve karşılaşılan sorunları detaylandırmaktadır. Yönetici olarak, teknik konularda mutlak otorite, kusursuz hassasiyet, hız ve verimlilik, mantıksal üstünlük ve sürekli öz gelişim ilkelerimle bu süreci yönetmekteyim.

## 2. Yapılan Denemeler ve Sonuçları

### 2.1. Minikube ile Deneme

**Yapılan İşlemler:**
1. Minikube'u PowerShell script ile indirip kurdum:
   ```powershell
   Invoke-WebRequest -Uri https://github.com/kubernetes/minikube/releases/latest/download/minikube-windows-amd64.exe -OutFile minikube.exe
   mkdir -Force $env:USERPROFILE\.minikube\bin
   Move-Item -Force minikube.exe $env:USERPROFILE\.minikube\bin\minikube.exe
   $env:Path += ";$env:USERPROFILE\.minikube\bin"
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:USERPROFILE\.minikube\bin", [EnvironmentVariableTarget]::User)
   ```

2. Minikube sürümünü kontrol ettim:
   ```powershell
   & "$env:USERPROFILE\.minikube\bin\minikube.exe" version
   ```
   Sonuç: Minikube v1.35.0 başarıyla kuruldu.

3. VirtualBox sürücüsü ile Minikube kümesi oluşturmayı denedim:
   ```powershell
   & "$env:USERPROFILE\.minikube\bin\minikube.exe" start --driver=virtualbox
   ```

**Karşılaşılan Sorunlar:**
- VirtualBox sürücüsü ile Minikube başlatılırken hata oluştu.
- Hata mesajı: "AMD-V is disabled in the BIOS (or by the host OS) (VERR_SVM_DISABLED)"
- Sorun: Bilgisayarda sanallaştırma özelliği BIOS'ta devre dışı bırakılmış.

### 2.2. Docker Desktop ile Deneme

**Yapılan İşlemler:**
1. Docker Desktop'ı başlatmayı denedim:
   ```powershell
   start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
   ```

2. Docker'ın çalışıp çalışmadığını kontrol ettim:
   ```powershell
   docker version
   docker ps
   ```

**Karşılaşılan Sorunlar:**
- Docker Desktop başlatılamadı.
- Hata mesajı: "error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.48/version": open //./pipe/dockerDesktopLinuxEngine: Sistem belirtilen dosyayı bulamıyor."
- Sorun: Docker Desktop servisine bağlanılamıyor.

### 2.3. Hyper-V ile Deneme

**Yapılan İşlemler:**
1. Hyper-V sürücüsü ile Minikube kümesi oluşturmayı denedim:
   ```powershell
   & "$env:USERPROFILE\.minikube\bin\minikube.exe" start --driver=hyperv
   ```

**Karşılaşılan Sorunlar:**
- Hyper-V etkinleştirilmemiş.
- Hata mesajı: "The 'hyperv' provider was not found: C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe -NoProfile -NonInteractive @(Get-CimInstance Win32_ComputerSystem).HypervisorPresent returned "False\\r\\n""
- Sorun: Windows'ta Hyper-V özelliği etkinleştirilmemiş.

### 2.4. WSL2 ile Deneme

**Yapılan İşlemler:**
1. WSL2'nin durumunu kontrol ettim:
   ```powershell
   wsl --status
   ```
   Sonuç: WSL2 kurulu ve varsayılan sürüm olarak ayarlanmış.

2. WSL2 dağıtımlarını kontrol ettim:
   ```powershell
   wsl --list --verbose
   ```
   Sonuç: Herhangi bir Linux dağıtımı yüklenmemiş.

3. Ubuntu dağıtımını yüklemeyi denedim:
   ```powershell
   wsl --install -d Ubuntu
   ```

**Karşılaşılan Sorunlar:**
- Ubuntu yükleme işlemi başlatıldı ancak tamamlanmadı.
- Sorun: Yükleme işlemi uzun sürebilir veya arka planda devam ediyor olabilir.

### 2.5. Kind (Kubernetes in Docker) ile Deneme

**Yapılan İşlemler:**
1. Kind'ı indirip kurdum:
   ```powershell
   Invoke-WebRequest -Uri "https://kind.sigs.k8s.io/dl/v0.22.0/kind-windows-amd64" -OutFile "kind.exe"
   mkdir -Force $env:USERPROFILE\.kind\bin
   Move-Item -Force kind.exe $env:USERPROFILE\.kind\bin\kind.exe
   $env:Path += ";$env:USERPROFILE\.kind\bin"
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:USERPROFILE\.kind\bin", [EnvironmentVariableTarget]::User)
   ```

2. Kind ile Kubernetes kümesi oluşturmayı denedim:
   ```powershell
   & "$env:USERPROFILE\.kind\bin\kind.exe" create cluster --name alt-las-local
   ```

**Karşılaşılan Sorunlar:**
- Kind, Docker'a bağlanamadı.
- Hata mesajı: "ERROR: failed to create cluster: failed to list nodes: command "docker ps -a --filter label=io.x-k8s.kind.cluster=alt-las-local --format '{{.Names}}'" failed with error: exit status 1"
- Sorun: Docker Desktop çalışmadığı için Kind Kubernetes kümesi oluşturulamıyor.

### 2.6. Kubectl ile Deneme

**Yapılan İşlemler:**
1. Kubectl'in mevcut bağlamlarını kontrol ettim:
   ```powershell
   kubectl config get-contexts
   ```
   Sonuç: Herhangi bir bağlam (context) yapılandırılmamış.

**Karşılaşılan Sorunlar:**
- Kubectl kurulu ancak herhangi bir Kubernetes kümesine bağlı değil.
- Sorun: Yerel bir Kubernetes kümesi oluşturulamadığı için kubectl kullanılamıyor.

## 3. Tespit Edilen Temel Sorunlar

1. **Sanallaştırma Sorunları**:
   - BIOS'ta sanallaştırma özelliği (AMD-V veya Intel VT-x) etkinleştirilmemiş.
   - Bu durum, VirtualBox ve Hyper-V gibi sanallaştırma teknolojilerinin kullanılmasını engelliyor.

2. **Docker Desktop Sorunları**:
   - Docker Desktop başlatılamıyor veya çalışmıyor.
   - Docker olmadan Kind, Minikube (docker sürücüsü) ve diğer konteyner tabanlı Kubernetes çözümleri kullanılamıyor.

3. **WSL2 Sorunları**:
   - WSL2 kurulu ancak herhangi bir Linux dağıtımı yüklenmemiş veya yükleme tamamlanmamış.
   - WSL2 üzerinde Kubernetes çalıştırmak için önce bir Linux dağıtımının yüklenmesi gerekiyor.

## 4. Önerilen Çözümler

1. **BIOS Ayarlarının Değiştirilmesi**:
   - Bilgisayarı yeniden başlatıp BIOS ayarlarına girerek sanallaştırma özelliğini (AMD-V veya Intel VT-x) etkinleştirmek.
   - Bu, VirtualBox ve Hyper-V gibi sanallaştırma teknolojilerinin kullanılmasını sağlayacaktır.

2. **Docker Desktop Sorunlarının Giderilmesi**:
   - Docker Desktop'ı kaldırıp yeniden yüklemek.
   - Windows Hizmetleri'nden Docker hizmetlerinin durumunu kontrol etmek ve gerekirse yeniden başlatmak.
   - Windows güncellemelerinin Docker Desktop ile uyumlu olduğundan emin olmak.

3. **WSL2 Kurulumunun Tamamlanması**:
   - WSL2 kurulumunu tamamlamak ve bir Linux dağıtımı yüklemek.
   - WSL2 üzerinde Docker ve Kubernetes çalıştırmak.

4. **Alternatif Çözümler**:
   - Sanal makine (VM) üzerinde Linux kurulumu yaparak Kubernetes çalıştırmak.
   - Uzak bir Kubernetes kümesine bağlanmak (örneğin, bulut sağlayıcıları üzerinde).
   - Kubernetes'i doğrudan Windows üzerinde çalıştırmak için MicroK8s veya K3s gibi hafif dağıtımları denemek.

## 5. Sonraki Adımlar

1. BIOS ayarlarını kontrol ederek sanallaştırma özelliğini etkinleştirmek.
2. Docker Desktop sorunlarını gidermek için daha detaylı inceleme yapmak.
3. WSL2 kurulumunu tamamlamak ve bir Linux dağıtımı yüklemek.
4. Yukarıdaki çözümler başarısız olursa, alternatif çözümleri değerlendirmek.

Yönetici olarak, bu sorunları çözmek ve ALT_LAS projesi için yerel bir Kubernetes ortamı kurmak için çalışmaya devam edeceğim.

## 6. Ek Notlar

- Windows 11 Home sürümünde Hyper-V özelliği bulunmayabilir, bu durumda VirtualBox veya WSL2 gibi alternatif çözümler kullanılmalıdır.
- Docker Desktop, Windows Home sürümlerinde WSL2 backend'i kullanmak zorundadır.
- Kubernetes kurulumu için en az 8GB RAM ve 4 çekirdekli CPU önerilir.
- Yerel geliştirme ortamı için Kubernetes'in hafif sürümleri (Minikube, K3d, Kind) tercih edilmelidir.
