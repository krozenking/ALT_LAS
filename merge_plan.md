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

