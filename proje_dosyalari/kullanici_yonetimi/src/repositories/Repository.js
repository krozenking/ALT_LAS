// ALT_LAS Repository Arayüzü

/**
 * Temel repository arayüzü
 * @template T - Entity tipi
 */
class Repository {
  /**
   * Repository'yi başlatır
   * @param {Object} options - Repository seçenekleri
   */
  constructor(options = {}) {
    this.options = options;
  }
  
  /**
   * ID'ye göre entity bulur
   * @param {string|number} id - Entity ID
   * @returns {Promise<T|null>} - Bulunan entity veya null
   */
  async findById(id) {
    throw new Error('findById metodu implement edilmemiş');
  }
  
  /**
   * Tüm entity'leri bulur
   * @param {Object} filter - Filtreleme kriterleri
   * @param {Object} options - Sorgu seçenekleri (sıralama, sayfalama vb.)
   * @returns {Promise<Array<T>>} - Entity listesi
   */
  async findAll(filter = {}, options = {}) {
    throw new Error('findAll metodu implement edilmemiş');
  }
  
  /**
   * Entity'yi kaydeder (oluşturur veya günceller)
   * @param {T} entity - Kaydedilecek entity
   * @returns {Promise<T>} - Kaydedilen entity
   */
  async save(entity) {
    throw new Error('save metodu implement edilmemiş');
  }
  
  /**
   * Entity'yi siler
   * @param {string|number} id - Silinecek entity ID
   * @returns {Promise<boolean>} - Silme başarılı ise true, değilse false
   */
  async delete(id) {
    throw new Error('delete metodu implement edilmemiş');
  }
  
  /**
   * Belirli bir koşula göre entity sayısını döndürür
   * @param {Object} filter - Filtreleme kriterleri
   * @returns {Promise<number>} - Entity sayısı
   */
  async count(filter = {}) {
    throw new Error('count metodu implement edilmemiş');
  }
  
  /**
   * Belirli bir koşula göre entity'nin varlığını kontrol eder
   * @param {Object} filter - Filtreleme kriterleri
   * @returns {Promise<boolean>} - Entity varsa true, yoksa false
   */
  async exists(filter = {}) {
    throw new Error('exists metodu implement edilmemiş');
  }
}

module.exports = Repository;
