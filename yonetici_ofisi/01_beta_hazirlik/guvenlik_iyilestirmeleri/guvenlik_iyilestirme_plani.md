# Güvenlik İyileştirme Planı

**Tarih:** 7 Haziran 2025  
**Hazırlayan:** Ali Yıldız (Güvenlik Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Aşaması Güvenlik İyileştirme Planı

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta aşaması için güvenlik iyileştirme planını içermektedir. Bu plan, alpha aşamasında tespit edilen güvenlik sorunlarını gidermek ve beta aşamasında daha güvenli bir sistem sağlamak amacıyla hazırlanmıştır. Güvenlik iyileştirmeleri, güvenlik mühendisi Ali Yıldız tarafından gerçekleştirilecektir.

## 2. Mevcut Güvenlik Sorunları

Alpha aşamasında tespit edilen güvenlik sorunları aşağıdaki gibidir:

### 2.1. Kimlik Doğrulama ve Yetkilendirme Sorunları

- **API Gateway'de Kimlik Doğrulama Token Yenileme Güvenlik Açığı (API-089)**: Token yenileme mekanizmasındaki bir hata nedeniyle, belirli durumlarda geçersiz tokenlar kabul edilebiliyor.
- **Yetersiz Rol Tabanlı Erişim Kontrolü**: Kullanıcı rolleri ve izinleri yeterince granüler değil.
- **Zayıf Parola Politikaları**: Parola karmaşıklığı ve değiştirme politikaları yeterince sıkı değil.

### 2.2. Veri Güvenliği Sorunları

- **Eksik Veri Şifreleme**: Hassas veriler yeterince şifrelenmemiş.
- **Yetersiz Veri Maskeleme**: Hassas veriler kullanıcı arayüzünde ve günlüklerde yeterince maskelenmiyor.
- **Veri Sızıntısı Riski**: Veri sızıntısını önleyecek mekanizmalar yetersiz.

### 2.3. Ağ Güvenliği Sorunları

- **Yetersiz NetworkPolicy Yapılandırması (K8S-005)**: Kubernetes NetworkPolicy'leri çok kısıtlayıcı veya yetersiz.
- **TLS Yapılandırması**: TLS 1.2 kullanılıyor, TLS 1.3'e geçiş yapılmamış.
- **API Gateway Güvenlik Duvarı**: Web Application Firewall (WAF) yapılandırması yetersiz.

### 2.4. Konteyner Güvenliği Sorunları

- **Docker İmajlarında Güvenlik Açıkları (DOC-003)**: Docker imajları güvenlik açıkları içeriyor.
- **Konteyner Çalışma Zamanı Güvenliği**: Konteyner çalışma zamanı güvenlik kontrolleri yetersiz.
- **Kubernetes Pod Güvenliği**: Pod güvenlik politikaları uygulanmamış.

### 2.5. İzleme ve Günlük Kaydı Sorunları

- **Yetersiz Güvenlik İzleme**: Güvenlik olayları yeterince izlenmiyor.
- **Dağınık Günlük Kaydı**: Günlük kayıtları merkezi bir sistemde toplanmıyor.
- **Anormal Davranış Tespiti**: Anormal davranışları tespit edecek mekanizmalar yetersiz.

## 3. Güvenlik İyileştirme Alanları

Güvenlik iyileştirme çalışmaları aşağıdaki alanlarda gerçekleştirilecektir:

### 3.1. Kimlik Doğrulama ve Yetkilendirme İyileştirmeleri

- API Gateway'de kimlik doğrulama token yenileme mekanizmasının iyileştirilmesi
- Rol tabanlı erişim kontrolünün (RBAC) geliştirilmesi
- Parola politikalarının güçlendirilmesi
- OAuth 2.0 ve OpenID Connect entegrasyonu

### 3.2. Veri Güvenliği İyileştirmeleri

- Hassas veriler için uçtan uca şifreleme uygulanması
- Veritabanı şifreleme mekanizmalarının iyileştirilmesi
- Veri maskeleme ve anonimleştirme özelliklerinin eklenmesi
- Veri sızıntısı önleme mekanizmalarının uygulanması

### 3.3. Ağ Güvenliği İyileştirmeleri

- Kubernetes NetworkPolicy yapılandırmasının iyileştirilmesi
- TLS 1.3'e geçiş yapılması
- API Gateway güvenlik duvarının iyileştirilmesi
- DDoS koruma mekanizmalarının eklenmesi

### 3.4. Konteyner Güvenliği İyileştirmeleri

- Docker imajlarının güvenlik açıkları için taranması ve güncellenmesi
- Minimal temel imajların kullanılması
- Konteyner çalışma zamanı güvenliğinin iyileştirilmesi
- Kubernetes Pod güvenlik politikalarının uygulanması

### 3.5. İzleme ve Günlük Kaydı İyileştirmeleri

- Merkezi güvenlik günlük kaydı sisteminin uygulanması
- Güvenlik olayları için gerçek zamanlı izleme eklenmesi
- Anormal davranış tespiti mekanizmalarının uygulanması
- Güvenlik olayları için otomatik uyarı sisteminin eklenmesi

## 4. Güvenlik İyileştirme Adımları

### 4.1. Kimlik Doğrulama ve Yetkilendirme İyileştirmeleri

#### 4.1.1. API Gateway'de Kimlik Doğrulama Token Yenileme Mekanizmasının İyileştirilmesi

```java
@Service
public class TokenService {
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final BlacklistedTokenRepository blacklistedTokenRepository;

    public TokenService(JwtTokenProvider jwtTokenProvider, UserRepository userRepository, BlacklistedTokenRepository blacklistedTokenRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
        this.blacklistedTokenRepository = blacklistedTokenRepository;
    }

    public TokenResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new InvalidTokenException("Invalid refresh token");
        }

        String username = jwtTokenProvider.getUsernameFromToken(refreshToken);
        UserDetails userDetails = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Blacklist the old refresh token
        blacklistedTokenRepository.save(new BlacklistedToken(refreshToken, jwtTokenProvider.getExpirationDateFromToken(refreshToken)));

        // Generate new tokens
        String newAccessToken = jwtTokenProvider.generateAccessToken(userDetails);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        return new TokenResponse(newAccessToken, newRefreshToken);
    }
}
```

#### 4.1.2. Rol Tabanlı Erişim Kontrolünün (RBAC) Geliştirilmesi

```java
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    private final JwtTokenFilter jwtTokenFilter;

    public SecurityConfig(JwtTokenFilter jwtTokenFilter) {
        this.jwtTokenFilter = jwtTokenFilter;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()
            .antMatchers("/api/auth/**").permitAll()
            .antMatchers("/api/admin/**").hasRole("ADMIN")
            .antMatchers("/api/manager/**").hasAnyRole("ADMIN", "MANAGER")
            .antMatchers("/api/user/**").hasAnyRole("ADMIN", "MANAGER", "USER")
            .anyRequest().authenticated()
            .and()
            .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class);
    }
}
```

#### 4.1.3. Parola Politikalarının Güçlendirilmesi

```java
@Component
public class PasswordValidator {
    private static final String PASSWORD_PATTERN = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{10,}$";
    private static final Pattern pattern = Pattern.compile(PASSWORD_PATTERN);

    public boolean isValid(String password) {
        Matcher matcher = pattern.matcher(password);
        return matcher.matches();
    }

    public List<String> getPasswordRequirements() {
        List<String> requirements = new ArrayList<>();
        requirements.add("En az 10 karakter uzunluğunda olmalı");
        requirements.add("En az bir rakam içermeli");
        requirements.add("En az bir küçük harf içermeli");
        requirements.add("En az bir büyük harf içermeli");
        requirements.add("En az bir özel karakter içermeli (@#$%^&+=)");
        requirements.add("Boşluk içermemeli");
        return requirements;
    }
}
```

### 4.2. Veri Güvenliği İyileştirmeleri

#### 4.2.1. Hassas Veriler İçin Uçtan Uca Şifreleme Uygulanması

```java
@Service
public class EncryptionService {
    private final KeyStore keyStore;
    private final String keyAlias;
    private final String keyPassword;

    public EncryptionService(@Value("${encryption.keystore.path}") String keystorePath,
                            @Value("${encryption.keystore.password}") String keystorePassword,
                            @Value("${encryption.key.alias}") String keyAlias,
                            @Value("${encryption.key.password}") String keyPassword) throws Exception {
        this.keyAlias = keyAlias;
        this.keyPassword = keyPassword;
        
        keyStore = KeyStore.getInstance("PKCS12");
        keyStore.load(new FileInputStream(keystorePath), keystorePassword.toCharArray());
    }

    public String encrypt(String data) throws Exception {
        Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
        cipher.init(Cipher.ENCRYPT_MODE, keyStore.getCertificate(keyAlias).getPublicKey());
        byte[] encryptedBytes = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(encryptedBytes);
    }

    public String decrypt(String encryptedData) throws Exception {
        Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
        cipher.init(Cipher.DECRYPT_MODE, (PrivateKey) keyStore.getKey(keyAlias, keyPassword.toCharArray()));
        byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedData));
        return new String(decryptedBytes, StandardCharsets.UTF_8);
    }
}
```

#### 4.2.2. Veri Maskeleme ve Anonimleştirme Özelliklerinin Eklenmesi

```java
@Component
public class DataMaskingService {
    public String maskCreditCard(String creditCardNumber) {
        if (creditCardNumber == null || creditCardNumber.length() < 13) {
            return creditCardNumber;
        }
        return creditCardNumber.substring(0, 6) + "******" + creditCardNumber.substring(creditCardNumber.length() - 4);
    }

    public String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return email;
        }
        String[] parts = email.split("@");
        String name = parts[0];
        String domain = parts[1];
        
        String maskedName = name.substring(0, Math.min(3, name.length())) + "***";
        return maskedName + "@" + domain;
    }

    public String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 10) {
            return phoneNumber;
        }
        return phoneNumber.substring(0, 3) + "****" + phoneNumber.substring(phoneNumber.length() - 3);
    }
}
```

### 4.3. Ağ Güvenliği İyileştirmeleri

#### 4.3.1. Kubernetes NetworkPolicy Yapılandırmasının İyileştirilmesi

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-gateway-policy
  namespace: alt-las
spec:
  podSelector:
    matchLabels:
      app: api-gateway
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - ipBlock:
        cidr: 0.0.0.0/0
        except:
        - 10.0.0.0/8
        - 172.16.0.0/12
        - 192.168.0.0/16
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: segmentation-service
    ports:
    - protocol: TCP
      port: 8080
  - to:
    - podSelector:
        matchLabels:
          app: runner-service
    ports:
    - protocol: TCP
      port: 8080
  - to:
    - podSelector:
        matchLabels:
          app: archive-service
    ports:
    - protocol: TCP
      port: 8080
  - to:
    - podSelector:
        matchLabels:
          app: ai-orchestrator
    ports:
    - protocol: TCP
      port: 8080
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
```

#### 4.3.2. TLS 1.3'e Geçiş Yapılması

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: alt-las-ingress
  namespace: alt-las
  annotations:
    nginx.ingress.kubernetes.io/ssl-protocols: "TLSv1.3"
    nginx.ingress.kubernetes.io/ssl-ciphers: "TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256"
    nginx.ingress.kubernetes.io/ssl-prefer-server-ciphers: "true"
    nginx.ingress.kubernetes.io/hsts: "true"
    nginx.ingress.kubernetes.io/hsts-max-age: "31536000"
    nginx.ingress.kubernetes.io/hsts-include-subdomains: "true"
    nginx.ingress.kubernetes.io/hsts-preload: "true"
spec:
  tls:
  - hosts:
    - api.alt-las.com
    secretName: alt-las-tls
  rules:
  - host: api.alt-las.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 8080
```

### 4.4. Konteyner Güvenliği İyileştirmeleri

#### 4.4.1. Docker İmajlarının Güvenlik Açıkları İçin Taranması

```bash
#!/bin/bash
# scan-docker-images.sh

# Trivy kullanarak Docker imajlarını tara
for image in $(docker images --format "{{.Repository}}:{{.Tag}}" | grep -v "<none>"); do
  echo "Scanning $image..."
  trivy image --severity HIGH,CRITICAL $image
done
```

#### 4.4.2. Kubernetes Pod Güvenlik Politikalarının Uygulanması

```yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: alt-las-restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  hostNetwork: false
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  supplementalGroups:
    rule: 'MustRunAs'
    ranges:
      - min: 1
        max: 65535
  fsGroup:
    rule: 'MustRunAs'
    ranges:
      - min: 1
        max: 65535
  readOnlyRootFilesystem: true
```

### 4.5. İzleme ve Günlük Kaydı İyileştirmeleri

#### 4.5.1. Merkezi Güvenlik Günlük Kaydı Sisteminin Uygulanması

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
  namespace: logging
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag kubernetes.*
      read_from_head true
      <parse>
        @type json
        time_format %Y-%m-%dT%H:%M:%S.%NZ
      </parse>
    </source>

    <filter kubernetes.**>
      @type kubernetes_metadata
      kubernetes_url https://kubernetes.default.svc
      bearer_token_file /var/run/secrets/kubernetes.io/serviceaccount/token
      ca_file /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    </filter>

    <match kubernetes.var.log.containers.**>
      @type elasticsearch
      host elasticsearch
      port 9200
      logstash_format true
      logstash_prefix k8s
      <buffer>
        @type file
        path /var/log/fluentd-buffers/kubernetes.system.buffer
        flush_mode interval
        retry_type exponential_backoff
        flush_thread_count 2
        flush_interval 5s
        retry_forever
        retry_max_interval 30
        chunk_limit_size 2M
        queue_limit_length 8
        overflow_action block
      </buffer>
    </match>
```

## 5. Güvenlik İyileştirme Takvimi

| Görev | Başlangıç | Bitiş |
|-------|-----------|-------|
| Kimlik Doğrulama ve Yetkilendirme İyileştirmeleri | 7 Haziran 2025 | 8 Haziran 2025 |
| Veri Güvenliği İyileştirmeleri | 8 Haziran 2025 | 9 Haziran 2025 |
| Ağ Güvenliği İyileştirmeleri | 9 Haziran 2025 | 10 Haziran 2025 |
| Konteyner Güvenliği İyileştirmeleri | 7 Haziran 2025 | 9 Haziran 2025 |
| İzleme ve Günlük Kaydı İyileştirmeleri | 9 Haziran 2025 | 10 Haziran 2025 |

## 6. Güvenlik Test Planı

Güvenlik iyileştirmelerinin etkinliğini doğrulamak için aşağıdaki testler yapılacaktır:

### 6.1. Penetrasyon Testi

- Kimlik doğrulama ve yetkilendirme mekanizmalarının testi
- API güvenlik testi
- Enjeksiyon saldırıları testi
- XSS ve CSRF testi

### 6.2. Güvenlik Taraması

- Kod güvenlik taraması
- Konteyner güvenlik taraması
- Ağ güvenlik taraması
- Veritabanı güvenlik taraması

### 6.3. Uyumluluk Testi

- OWASP Top 10 uyumluluk testi
- GDPR uyumluluk testi
- PCI DSS uyumluluk testi
- ISO 27001 uyumluluk testi

## 7. Sonuç

Bu güvenlik iyileştirme planı, ALT_LAS projesinin beta aşamasında daha güvenli bir sistem sağlamak amacıyla hazırlanmıştır. Plan, kimlik doğrulama ve yetkilendirme iyileştirmeleri, veri güvenliği iyileştirmeleri, ağ güvenliği iyileştirmeleri, konteyner güvenliği iyileştirmeleri ve izleme ve günlük kaydı iyileştirmeleri gibi çeşitli alanlarda iyileştirmeler içermektedir. Bu iyileştirmeler, güvenlik mühendisi Ali Yıldız tarafından gerçekleştirilecektir. Güvenlik iyileştirmelerinin başarısı, çeşitli güvenlik testleri ile doğrulanacaktır.
