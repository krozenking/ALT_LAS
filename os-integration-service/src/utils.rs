pub mod logging {
    use log::{LevelFilter, info};
    use env_logger::Builder;
    use std::io::Write;
    
    /// Loglama sistemini yapılandırır
    pub fn setup_logging(level: LevelFilter) {
        let mut builder = Builder::new();
        
        builder.format(|buf, record| {
            writeln!(
                buf,
                "[{} {} {}:{}] {}",
                chrono::Local::now().format("%Y-%m-%d %H:%M:%S"),
                record.level(),
                record.file().unwrap_or("unknown"),
                record.line().unwrap_or(0),
                record.args()
            )
        })
        .filter(None, level);
        
        builder.init();
        
        info!("Loglama sistemi başlatıldı, seviye: {:?}", level);
    }
}

pub mod config {
    use serde::{Deserialize, Serialize};
    use std::fs;
    use std::path::Path;
    
    #[derive(Debug, Serialize, Deserialize)]
    pub struct ServiceConfig {
        pub server: ServerConfig,
        pub logging: LoggingConfig,
        pub features: FeaturesConfig,
    }
    
    #[derive(Debug, Serialize, Deserialize)]
    pub struct ServerConfig {
        pub host: String,
        pub port: u16,
        pub workers: usize,
    }
    
    #[derive(Debug, Serialize, Deserialize)]
    pub struct LoggingConfig {
        pub level: String,
        pub file: Option<String>,
    }
    
    #[derive(Debug, Serialize, Deserialize)]
    pub struct FeaturesConfig {
        pub enable_filesystem: bool,
        pub enable_process: bool,
        pub enable_screenshot: bool,
    }
    
    impl Default for ServiceConfig {
        fn default() -> Self {
            Self {
                server: ServerConfig {
                    host: "0.0.0.0".to_string(),
                    port: 8080,
                    workers: 4,
                },
                logging: LoggingConfig {
                    level: "info".to_string(),
                    file: None,
                },
                features: FeaturesConfig {
                    enable_filesystem: true,
                    enable_process: true,
                    enable_screenshot: true,
                },
            }
        }
    }
    
    impl ServiceConfig {
        pub fn load(path: &str) -> Result<Self, String> {
            let config_path = Path::new(path);
            
            if config_path.exists() {
                let config_str = fs::read_to_string(config_path)
                    .map_err(|e| format!("Yapılandırma dosyası okunamadı: {}", e))?;
                
                serde_json::from_str(&config_str)
                    .map_err(|e| format!("Yapılandırma dosyası ayrıştırılamadı: {}", e))
            } else {
                Ok(Self::default())
            }
        }
        
        pub fn save(&self, path: &str) -> Result<(), String> {
            let config_str = serde_json::to_string_pretty(self)
                .map_err(|e| format!("Yapılandırma JSON'a dönüştürülemedi: {}", e))?;
            
            fs::write(path, config_str)
                .map_err(|e| format!("Yapılandırma dosyası yazılamadı: {}", e))
        }
    }
}
