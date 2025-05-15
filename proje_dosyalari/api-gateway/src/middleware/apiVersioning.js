/**
 * API Versioning Middleware
 * 
 * Bu middleware, API versiyonlama stratejisini uygulamak için kullanılır.
 * URL yolu tabanlı versiyonlama (örn. /api/v1/resource) kullanır.
 */

/**
 * API versiyonlama middleware'i
 * @param {Object} options - Versiyonlama seçenekleri
 * @param {string} options.defaultVersion - Varsayılan API versiyonu
 * @param {Array} options.supportedVersions - Desteklenen API versiyonları
 * @returns {Function} Express middleware
 */
const apiVersioning = (options = {}) => {
  const {
    defaultVersion = 'v1',
    supportedVersions = ['v1']
  } = options;

  return (req, res, next) => {
    // URL'den versiyon bilgisini çıkar
    const urlParts = req.path.split('/');
    const versionIndex = urlParts.findIndex(part => part.match(/^v\d+$/));
    
    let version;
    
    if (versionIndex !== -1) {
      // URL'de versiyon belirtilmiş
      version = urlParts[versionIndex];
      
      // Desteklenmeyen versiyon kontrolü
      if (!supportedVersions.includes(version)) {
        return res.status(400).json({
          message: `Unsupported API version: ${version}`,
          error: `Supported versions are: ${supportedVersions.join(', ')}`
        });
      }
      
      // Versiyon bilgisini request nesnesine ekle
      req.apiVersion = version;
    } else {
      // URL'de versiyon belirtilmemiş, varsayılan kullan
      req.apiVersion = defaultVersion;
      
      // Yolu yeniden yapılandır (opsiyonel)
      // Bu, URL'de versiyon belirtilmediğinde otomatik olarak varsayılan versiyonu ekler
      // Örn: /resource -> /api/v1/resource
      if (!req.path.includes(`/api/${defaultVersion}/`)) {
        // Yalnızca API çağrıları için yeniden yönlendirme yap
        if (req.path.startsWith('/api/')) {
          const newPath = req.path.replace('/api/', `/api/${defaultVersion}/`);
          return res.redirect(307, newPath);
        }
      }
    }
    
    // API versiyon bilgisini response header'a ekle
    res.setHeader('X-API-Version', req.apiVersion);
    
    next();
  };
};

module.exports = apiVersioning;
