# ALT_LAS Dal Birleştirme Planı (Worker 9)

## 1. Amaç

Bu plan, `ALT_LAS` deposundaki `archive` ve `archived` dışındaki tüm aktif geliştirme dallarını `main` dalına birleştirmeyi ve ardından bu eski dalları arşivlemeyi amaçlamaktadır. Bu işlem, İşçi 9'un ana ve acil görevi olarak tanımlanmıştır.

## 2. Mevcut Durum ve Zorluklar

- Depoda `main` dışında birleştirilmesi gereken 9 adet dal bulunmaktadır.
- İlk birleştirme denemesi (`origin/ai-orchestrator-implementation` -> `main`) çok sayıda çakışma (merge conflict) ile sonuçlanmıştır. Bu, dallar arasında önemli kod farklılıkları olduğunu ve birleştirme işleminin dikkatli bir strateji gerektirdiğini göstermektedir.

## 3. Uzman Görüşleri ve Strateji Belirleme

Kullanıcının talebi üzerine, farklı uzmanlık alanlarından (Yazılım Mimarı, DevOps Mühendisi, Kıdemli Geliştirici) Git birleştirme çakışması çözüm stratejileri araştırılmıştır. Öne çıkan yaklaşımlar şunlardır:

- **Yazılım Mimarı Perspektifi:** Çakışmaların sadece kod satırları değil, aynı zamanda mimari tutarlılık açısından da değerlendirilmesi gerektiğini vurgular. Kodun genel tasarımına ve bütünlüğüne uygun çözümler üretilmelidir. Anlaşılması zor veya riskli durumlarda manuel çözüm ve dikkatli inceleme önerilir.
- **DevOps Mühendisi Perspektifi:** Sürecin tekrarlanabilirliği, otomasyonu ve CI/CD ile entegrasyonuna odaklanır. Merge araçlarının etkin kullanımı, test edilebilirliği ve gerekirse geri alınabilirliği (rollback) kolaylaştıran stratejiler (örn. belirli durumlarda squash merge) önemlidir. Ancak, karmaşık çakışmalarda otomasyonun riskli olabileceği kabul edilir.
- **Kıdemli Geliştirici Perspektifi:** İletişim ve işbirliğinin önemini vurgular. Çakışan kod parçalarını yazan geliştiricilerle iletişim kurmak (mümkünse), değişikliklerin amacını anlamak ve manuel olarak, dikkatlice çözüm yapmak genellikle en güvenli yoldur. Küçük adımlarla ilerlemek, sık sık entegrasyon yapmak ve merge araçlarını etkin kullanmak önerilir. Otomatik stratejilerden (`ours`/`theirs`) kaçınılması gerektiği belirtilir.

**Ortak Temalar ve Seçilen Strateji:**

Her üç perspektif de karmaşık durumlarda **dikkatli ve manuel çözümün** önemini vurgulamaktadır. Otomatik stratejiler risklidir. İletişim ve kodun anlaşılması kritiktir.

Bu doğrultuda, aşağıdaki **adım adım manuel birleştirme ve çakışma çözümü** stratejisi benimsenmiştir:

## 4. Uygulanacak Birleştirme Planı

1.  **Hazırlık:**
    *   Yerel `main` dalının güncel olduğundan emin olun (`git checkout main && git pull origin main`).
    *   Tüm uzak dalların en son hallerini çekin (`git fetch --all`).
2.  **Sıralı Birleştirme:** Aşağıdaki sırayla her bir dal `main` dalına birleştirilecektir:
    1.  `origin/ai-orchestrator-implementation`
    2.  `origin/devdebug/partial-merge-state`
    3.  `origin/fix-pr-20`
    4.  `origin/integration/worker9-merge`
    5.  `origin/isci5-ui-gelistirme`
    6.  `origin/ui-accessibility-improvements`
    7.  `origin/update-dependencies`
    8.  `origin/worker4/backup-retention-features`
    9.  `origin/worker4/elasticsearch-integration`
3.  **Birleştirme Komutu:** Her dal için standart `git merge <branch_name>` komutu kullanılacaktır.
4.  **Çakışma Yönetimi:**
    *   **Çakışma Olmazsa:** Birleştirme başarılı olursa, değişiklikler hemen `main` dalına commit edilir (`git commit -m "Merge branch '<branch_name>' into main"`).
    *   **Çakışma Olursa:**
        1.  `git status` komutu ile çakışan dosyalar listelenir.
        2.  Çakışan dosyalar ve çakışma detayları (hangi kısımların çakıştığına dair özet bilgi) kullanıcıya **bildirilir**.
        3.  Kullanıcıdan **her bir çakışma için nasıl bir çözüm uygulanacağına dair spesifik talimat beklenir**. (Örn: "Şu dosyadaki çakışmada gelen değişikliği (`theirs`) kabul et", "Bu dosyadaki çakışmayı manuel olarak şu şekilde düzenle: ...")
        4.  Alınan talimatlara göre çakışmalar manuel olarak çözülür.
        5.  Çözülen dosyalar `git add <conflicted_file>` komutu ile işaretlenir.
        6.  Tüm çakışmalar çözüldükten sonra birleştirme işlemi tamamlanır (`git commit -m "Merge branch '<branch_name>' into main (conflicts resolved)"`).
        7.  Eğer kullanıcı talimat veremezse veya çözüm karmaşıksa, birleştirme iptal edilir (`git merge --abort`) ve durum kullanıcıya bildirilerek farklı bir yaklaşım (örn. dalı atlamak, daha detaylı inceleme istemek) tartışılır.
5.  **Push İşlemi:** Her başarılı birleştirmeden (veya çakışma çözümünden) sonra, `main` dalı GitHub'a push edilir (`git push origin main`). Bu, ilerlemeyi kaydeder ve olası sorunlarda geri dönmeyi kolaylaştırır.
6.  **Dalları Arşivleme:** Tüm dallar başarıyla `main`'e birleştirildikten sonra, kullanıcı ile teyit edilerek eski dallar silinir (`git push origin --delete <branch_name>`).

## 5. Riskler ve Önlemler

- **Risk:** Çok sayıda veya karmaşık çakışma nedeniyle sürecin uzaması.
    - **Önlem:** Kullanıcı ile yakın iletişim halinde kalarak çakışma çözümlerini hızlandırmak. Her başarılı birleştirmeden sonra push yaparak ilerlemeyi kaydetmek.
- **Risk:** Yanlış çakışma çözümü nedeniyle hatalı kodun `main` dalına girmesi.
    - **Önlem:** Kullanıcıdan net talimatlar almak. Şüpheli durumlarda tekrar sormak. Otomatik stratejilerden kaçınmak.

## 6. Onay

Bu planın uygulanabilmesi için kullanıcı onayı gerekmektedir.




## 7. Birleştirme vs. Yeniden Yazma Değerlendirmesi

**Analiz:**

`git diff --stat` komutu ile yapılan analiz, birleştirilmesi hedeflenen dalların karmaşıklığını ortaya koymuştur:

- **Yüksek Karmaşıklık / Büyük Değişiklikler:**
    - `origin/ai-orchestrator-implementation`: Çok sayıda yeni dosya ve binlerce satır ekleme (AI Orchestrator servisi).
    - `origin/devdebug/partial-merge-state`: Birden fazla serviste (API Gateway, Archive Service) önemli değişiklikler.
    - `origin/fix-pr-20`: UI tarafında (ui-desktop) binlerce satır ekleme/çıkarma.
    - `origin/isci5-ui-gelistirme`: UI tarafında (ui-desktop) binlerce satır ekleme/çıkarma.
    - `origin/worker4/backup-retention-features`: Archive Service üzerinde önemli değişiklikler.
    - `origin/worker4/elasticsearch-integration`: Archive Service ve UI tarafında önemli değişiklikler.
- **Düşük Karmaşıklık / Fark Yok:**
    - `origin/integration/worker9-merge`
    - `origin/ui-accessibility-improvements`
    - `origin/update-dependencies`

İlk birleştirme denemesinde (`ai-orchestrator-implementation`) karşılaşılan çok sayıda çakışma, bu yüksek karmaşıklığı teyit etmektedir.

**Seçenekler:**

1.  **Birleştirme:**
    *   **Artıları:** Git geçmişini korur, mevcut çalışmayı kullanır, çakışmalar yönetilebilirse daha hızlı olabilir.
    *   **Eksileri:** Çok yüksek çakışma riski, çakışma çözümünün aşırı zaman alıcı ve hataya açık olması (özellikle farklı servisler ve diller arası), entegrasyonun çok zorlu olması bekleniyor.
2.  **Yeniden Yazma:**
    *   **Artıları:** Karmaşık çakışmalardan kaçınır, en güncel `main` dalı üzerine temiz bir başlangıç sağlar, tutarlılık ve kalite kontrolü daha kolay olabilir.
    *   **Eksileri:** Orijinal geliştirme geçmişini kaybeder, önemli miktarda işlevselliğin (binlerce satır) yeniden yazılmasını gerektirir, zaman alıcı olabilir, orijinal implementasyondaki detayların kaçırılma riski vardır.

**Değerlendirme ve Öneri:**

Özellikle `ai-orchestrator-implementation`, `fix-pr-20`, `isci5-ui-gelistirme` gibi dallardaki değişikliklerin büyüklüğü ve birden fazla servisi etkilemesi göz önüne alındığında, **birleştirme işleminin aşırı derecede karmaşık, zaman alıcı ve riskli olması kuvvetle muhtemeldir.** Tüm bu dalları sırayla birleştirmeye çalışmak, çözülmesi çok zor veya imkansız çakışmalara yol açabilir.

Bu nedenle, **yeniden yazma yaklaşımı daha yönetilebilir ve öngörülebilir görünmektedir.** Yüksek karmaşıklıktaki dallarda bulunan özelliklerin, en güncel `main` dalı temel alınarak, ilgili işçiler (örn. İşçi 10, İşçi 5, İşçi 4, İşçi 7) tarafından yeniden implemente edilmesi önerilir. Farklılık göstermeyen dallar (`integration/worker9-merge`, `ui-accessibility-improvements`, `update-dependencies`) ise güvenle silinebilir.

Bu yaklaşım, geliştirme eforu gerektirse de, büyük ölçekli ve kontrolü zor bir birleştirme sürecinin risklerinden kaçınmayı sağlayacaktır.

**Önerilen Yeni Strateji:**

1.  İşçi 9, **birleştirme işlemini YAPMAYACAKTIR.**
2.  İşçi 9, fark göstermeyen dalları (`integration/worker9-merge`, `ui-accessibility-improvements`, `update-dependencies`) silecektir.
3.  Yüksek karmaşıklıktaki dallarda (`ai-orchestrator-implementation`, `devdebug/partial-merge-state`, `fix-pr-20`, `isci5-ui-gelistirme`, `worker4/backup-retention-features`, `worker4/elasticsearch-integration`) bulunan özelliklerin, ilgili işçiler (İşçi 10, 5, 4, 7 vb.) tarafından `main` dalı üzerine yeniden yazılması için görevlendirme yapılmalıdır. Bu dallar referans olarak korunabilir ancak `main` ile birleştirilmemelidir.
4.  İşçi 9, bu yeni stratejiyi dokümante edip (bu dosyanın güncellenmiş hali) onay aldıktan sonra sadece fark göstermeyen dalları silme işlemini yapacaktır.

