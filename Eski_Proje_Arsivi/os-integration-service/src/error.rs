use thiserror::Error;

#[derive(Error, Debug)]
pub enum OsIntegrationError {
    #[error("Dosya sistemi hatası: {0}")]
    FileSystemError(String),
    
    #[error("İşlem yönetimi hatası: {0}")]
    ProcessError(String),
    
    #[error("Ekran yakalama hatası: {0}")]
    ScreenshotError(String),
    
    #[error("Platform hatası: {0}")]
    PlatformError(String),
    
    #[error("API hatası: {0}")]
    ApiError(String),
    
    #[error("Desteklenmeyen işletim sistemi")]
    UnsupportedOsError,
    
    #[error("İç hata: {0}")]
    InternalError(String),
}
