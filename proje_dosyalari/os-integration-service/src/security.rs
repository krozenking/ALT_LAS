// Security module for OS Integration Service
// This module provides security features for authentication, authorization, and encryption

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use log::{info, error, warn, debug};
use rand::{thread_rng, Rng};
use rand::distributions::Alphanumeric;
use sha2::{Sha256, Digest};
use hmac::{Hmac, Mac};
use base64::{Engine as _, engine::general_purpose};
use serde::{Serialize, Deserialize};

type HmacSha256 = Hmac<Sha256>;

// Authentication configuration
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AuthConfig {
    pub enabled: bool,
    pub token_expiration_seconds: u64,
    pub require_https: bool,
    pub allowed_origins: Vec<String>,
    pub max_failed_attempts: u32,
    pub lockout_duration_seconds: u64,
}

impl Default for AuthConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            token_expiration_seconds: 3600, // 1 hour
            require_https: true,
            allowed_origins: vec!["localhost".to_string()],
            max_failed_attempts: 5,
            lockout_duration_seconds: 300, // 5 minutes
        }
    }
}

// User role for authorization
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum UserRole {
    Admin,
    User,
    ReadOnly,
}

// User information
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct User {
    pub username: String,
    pub password_hash: String,
    pub salt: String,
    pub role: UserRole,
    pub created_at: u64,
    pub last_login: Option<u64>,
    pub failed_attempts: u32,
    pub locked_until: Option<u64>,
}

// Authentication token
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AuthToken {
    pub token: String,
    pub user: String,
    pub role: UserRole,
    pub created_at: u64,
    pub expires_at: u64,
}

// Authentication manager
pub struct AuthManager {
    config: AuthConfig,
    users: Arc<Mutex<HashMap<String, User>>>,
    tokens: Arc<Mutex<HashMap<String, AuthToken>>>,
    secret_key: String,
}

impl AuthManager {
    // Create a new authentication manager
    pub fn new(config: AuthConfig) -> Self {
        let secret_key = generate_secret_key();
        
        Self {
            config,
            users: Arc::new(Mutex::new(HashMap::new())),
            tokens: Arc::new(Mutex::new(HashMap::new())),
            secret_key,
        }
    }
    
    // Add a new user
    pub fn add_user(&self, username: &str, password: &str, role: UserRole) -> Result<(), String> {
        let mut users = self.users.lock().unwrap();
        
        if users.contains_key(username) {
            return Err("User already exists".to_string());
        }
        
        let salt = generate_salt();
        let password_hash = hash_password(password, &salt);
        
        let user = User {
            username: username.to_string(),
            password_hash,
            salt,
            role,
            created_at: current_timestamp(),
            last_login: None,
            failed_attempts: 0,
            locked_until: None,
        };
        
        users.insert(username.to_string(), user);
        Ok(())
    }
    
    // Authenticate user and generate token
    pub fn authenticate(&self, username: &str, password: &str) -> Result<AuthToken, String> {
        let mut users = self.users.lock().unwrap();
        
        let user = users.get_mut(username).ok_or("Invalid username or password".to_string())?;
        
        // Check if account is locked
        if let Some(locked_until) = user.locked_until {
            if locked_until > current_timestamp() {
                return Err("Account is locked. Try again later.".to_string());
            } else {
                // Reset lockout if expired
                user.locked_until = None;
                user.failed_attempts = 0;
            }
        }
        
        // Verify password
        let password_hash = hash_password(password, &user.salt);
        if password_hash != user.password_hash {
            // Increment failed attempts
            user.failed_attempts += 1;
            
            // Check if account should be locked
            if user.failed_attempts >= self.config.max_failed_attempts {
                let locked_until = current_timestamp() + self.config.lockout_duration_seconds;
                user.locked_until = Some(locked_until);
                return Err("Too many failed attempts. Account is locked.".to_string());
            }
            
            return Err("Invalid username or password".to_string());
        }
        
        // Reset failed attempts on successful login
        user.failed_attempts = 0;
        user.locked_until = None;
        user.last_login = Some(current_timestamp());
        
        // Generate token
        let token = generate_token();
        let created_at = current_timestamp();
        let expires_at = created_at + self.config.token_expiration_seconds;
        
        let auth_token = AuthToken {
            token: token.clone(),
            user: username.to_string(),
            role: user.role.clone(),
            created_at,
            expires_at,
        };
        
        // Store token
        let mut tokens = self.tokens.lock().unwrap();
        tokens.insert(token.clone(), auth_token.clone());
        
        Ok(auth_token)
    }
    
    // Validate token
    pub fn validate_token(&self, token: &str) -> Result<AuthToken, String> {
        let mut tokens = self.tokens.lock().unwrap();
        
        let auth_token = tokens.get(token).ok_or("Invalid token".to_string())?;
        
        // Check if token is expired
        if auth_token.expires_at < current_timestamp() {
            tokens.remove(token);
            return Err("Token expired".to_string());
        }
        
        Ok(auth_token.clone())
    }
    
    // Revoke token
    pub fn revoke_token(&self, token: &str) -> Result<(), String> {
        let mut tokens = self.tokens.lock().unwrap();
        
        if tokens.remove(token).is_none() {
            return Err("Token not found".to_string());
        }
        
        Ok(())
    }
    
    // Check if user has required role
    pub fn check_role(&self, token: &str, required_role: UserRole) -> Result<(), String> {
        let auth_token = self.validate_token(token)?;
        
        match auth_token.role {
            UserRole::Admin => Ok(()), // Admin can do anything
            UserRole::User => {
                if required_role == UserRole::Admin {
                    Err("Insufficient permissions".to_string())
                } else {
                    Ok(())
                }
            },
            UserRole::ReadOnly => {
                if required_role == UserRole::Admin || required_role == UserRole::User {
                    Err("Insufficient permissions".to_string())
                } else {
                    Ok(())
                }
            },
        }
    }
    
    // Generate HMAC signature for data
    pub fn generate_signature(&self, data: &str) -> String {
        let mut mac = HmacSha256::new_from_slice(self.secret_key.as_bytes())
            .expect("HMAC can take key of any size");
        
        mac.update(data.as_bytes());
        let result = mac.finalize();
        let code_bytes = result.into_bytes();
        
        general_purpose::STANDARD.encode(code_bytes)
    }
    
    // Verify HMAC signature
    pub fn verify_signature(&self, data: &str, signature: &str) -> bool {
        let expected = self.generate_signature(data);
        secure_compare(&expected, signature)
    }
    
    // Clean up expired tokens
    pub fn cleanup_expired_tokens(&self) {
        let mut tokens = self.tokens.lock().unwrap();
        let current_time = current_timestamp();
        
        tokens.retain(|_, token| token.expires_at > current_time);
    }
}

// Encryption manager for sensitive data
pub struct EncryptionManager {
    key: Vec<u8>,
}

impl EncryptionManager {
    // Create a new encryption manager
    pub fn new(key: Option<&str>) -> Self {
        let key = match key {
            Some(k) => {
                let mut hasher = Sha256::new();
                hasher.update(k.as_bytes());
                hasher.finalize().to_vec()
            },
            None => {
                // Generate random key
                let random_key: String = thread_rng()
                    .sample_iter(&Alphanumeric)
                    .take(32)
                    .map(char::from)
                    .collect();
                
                let mut hasher = Sha256::new();
                hasher.update(random_key.as_bytes());
                hasher.finalize().to_vec()
            }
        };
        
        Self { key }
    }
    
    // Encrypt data
    pub fn encrypt(&self, data: &str) -> Result<String, String> {
        // This is a simplified implementation
        // In a real application, use a proper encryption library like AES
        
        let mut encrypted = Vec::new();
        for (i, byte) in data.bytes().enumerate() {
            let key_byte = self.key[i % self.key.len()];
            encrypted.push(byte ^ key_byte);
        }
        
        Ok(general_purpose::STANDARD.encode(encrypted))
    }
    
    // Decrypt data
    pub fn decrypt(&self, encrypted: &str) -> Result<String, String> {
        // This is a simplified implementation
        // In a real application, use a proper encryption library like AES
        
        let encrypted_bytes = general_purpose::STANDARD.decode(encrypted)
            .map_err(|e| format!("Failed to decode base64: {}", e))?;
        
        let mut decrypted = Vec::new();
        for (i, byte) in encrypted_bytes.iter().enumerate() {
            let key_byte = self.key[i % self.key.len()];
            decrypted.push(byte ^ key_byte);
        }
        
        String::from_utf8(decrypted)
            .map_err(|e| format!("Failed to decode UTF-8: {}", e))
    }
}

// Helper functions

// Generate a random secret key
fn generate_secret_key() -> String {
    thread_rng()
        .sample_iter(&Alphanumeric)
        .take(64)
        .map(char::from)
        .collect()
}

// Generate a random salt
fn generate_salt() -> String {
    thread_rng()
        .sample_iter(&Alphanumeric)
        .take(16)
        .map(char::from)
        .collect()
}

// Generate a random token
fn generate_token() -> String {
    thread_rng()
        .sample_iter(&Alphanumeric)
        .take(32)
        .map(char::from)
        .collect()
}

// Hash password with salt
fn hash_password(password: &str, salt: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(format!("{}{}", password, salt).as_bytes());
    let result = hasher.finalize();
    
    general_purpose::STANDARD.encode(result)
}

// Get current timestamp in seconds
fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or(Duration::from_secs(0))
        .as_secs()
}

// Constant-time string comparison to prevent timing attacks
fn secure_compare(a: &str, b: &str) -> bool {
    if a.len() != b.len() {
        return false;
    }
    
    let mut result = 0;
    for (x, y) in a.bytes().zip(b.bytes()) {
        result |= x ^ y;
    }
    
    result == 0
}

// Rate limiting for API endpoints
pub struct RateLimiter {
    limits: HashMap<String, u32>, // requests per minute for each endpoint
    requests: Arc<Mutex<HashMap<String, Vec<Instant>>>>, // IP + endpoint -> timestamps
}

impl RateLimiter {
    // Create a new rate limiter
    pub fn new() -> Self {
        let mut limits = HashMap::new();
        
        // Default limits for different endpoints
        limits.insert("default".to_string(), 60); // 60 requests per minute
        limits.insert("auth".to_string(), 10); // 10 auth requests per minute
        limits.insert("screenshot".to_string(), 30); // 30 screenshot requests per minute
        
        Self {
            limits,
            requests: Arc::new(Mutex::new(HashMap::new())),
        }
    }
    
    // Set custom limit for an endpoint
    pub fn set_limit(&mut self, endpoint: &str, limit: u32) {
        self.limits.insert(endpoint.to_string(), limit);
    }
    
    // Check if request is allowed
    pub fn check_limit(&self, ip: &str, endpoint: &str) -> bool {
        let mut requests = self.requests.lock().unwrap();
        let now = Instant::now();
        let one_minute_ago = now - Duration::from_secs(60);
        
        let key = format!("{}:{}", ip, endpoint);
        let timestamps = requests.entry(key).or_insert_with(Vec::new);
        
        // Remove timestamps older than 1 minute
        timestamps.retain(|&t| t > one_minute_ago);
        
        // Get limit for this endpoint or use default
        let limit = self.limits.get(endpoint).unwrap_or_else(|| self.limits.get("default").unwrap_or(&60));
        
        // Check if under limit
        if timestamps.len() as u32 >= *limit {
            return false;
        }
        
        // Add current timestamp
        timestamps.push(now);
        true
    }
    
    // Clean up old entries
    pub fn cleanup(&self) {
        let mut requests = self.requests.lock().unwrap();
        let one_minute_ago = Instant::now() - Duration::from_secs(60);
        
        for timestamps in requests.values_mut() {
            timestamps.retain(|&t| t > one_minute_ago);
        }
        
        // Remove empty entries
        requests.retain(|_, timestamps| !timestamps.is_empty());
    }
}

// IP filtering for API endpoints
pub struct IpFilter {
    whitelist: Vec<String>,
    blacklist: Vec<String>,
}

impl IpFilter {
    // Create a new IP filter
    pub fn new() -> Self {
        Self {
            whitelist: vec!["127.0.0.1".to_string(), "::1".to_string()], // localhost
            blacklist: Vec::new(),
        }
    }
    
    // Add IP to whitelist
    pub fn add_to_whitelist(&mut self, ip: &str) {
        if !self.whitelist.contains(&ip.to_string()) {
            self.whitelist.push(ip.to_string());
        }
    }
    
    // Add IP to blacklist
    pub fn add_to_blacklist(&mut self, ip: &str) {
        if !self.blacklist.contains(&ip.to_string()) {
            self.blacklist.push(ip.to_string());
        }
    }
    
    // Remove IP from whitelist
    pub fn remove_from_whitelist(&mut self, ip: &str) {
        self.whitelist.retain(|i| i != ip);
    }
    
    // Remove IP from blacklist
    pub fn remove_from_blacklist(&mut self, ip: &str) {
        self.blacklist.retain(|i| i != ip);
    }
    
    // Check if IP is allowed
    pub fn is_allowed(&self, ip: &str) -> bool {
        // If IP is in blacklist, deny access
        if self.blacklist.contains(&ip.to_string()) {
            return false;
        }
        
        // If whitelist is empty, allow all IPs
        if self.whitelist.is_empty() {
            return true;
        }
        
        // If IP is in whitelist, allow access
        self.whitelist.contains(&ip.to_string())
    }
}

// Audit logging for security events
pub struct AuditLogger {
    log_file: String,
}

impl AuditLogger {
    // Create a new audit logger
    pub fn new(log_file: &str) -> Self {
        Self {
            log_file: log_file.to_string(),
        }
    }
    
    // Log security event
    pub fn log_event(&self, event_type: &str, user: Option<&str>, ip: &str, details: &str) {
        let timestamp = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        let user_str = user.unwrap_or("anonymous");
        
        let log_entry = format!(
            "[{}] {} - User: {} - IP: {} - {}",
            timestamp, event_type, user_str, ip, details
        );
        
        // Log to file
        if let Ok(mut file) = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.log_file) {
            
            use std::io::Write;
            let _ = writeln!(file, "{}", log_entry);
        }
        
        // Also log using the logging framework
        info!("{}", log_entry);
    }
}
