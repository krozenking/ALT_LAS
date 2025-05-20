/**
 * Encryption service for end-to-end encryption of messages
 * 
 * This service uses the Web Crypto API to encrypt and decrypt messages
 * It implements a simplified version of the Signal Protocol
 * 
 * Note: In a production environment, you would use a more robust implementation
 * like Signal Protocol or libsignal-protocol-javascript
 */

// Key types
type PublicKey = CryptoKey;
type PrivateKey = CryptoKey;
type SymmetricKey = CryptoKey;

// Key pair
interface KeyPair {
  publicKey: PublicKey;
  privateKey: PrivateKey;
}

// Encrypted message
interface EncryptedMessage {
  iv: string; // Initialization vector (base64)
  ephemeralPublicKey: string; // Ephemeral public key (base64)
  ciphertext: string; // Encrypted message (base64)
  mac: string; // Message authentication code (base64)
}

// Encryption service
class EncryptionService {
  private static instance: EncryptionService;
  private keyPair: KeyPair | null = null;
  private sessionKeys: Map<string, SymmetricKey> = new Map();
  
  private constructor() {
    // Initialize encryption service
    this.initializeKeyPair();
  }
  
  // Get instance (singleton)
  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }
  
  // Initialize key pair
  private async initializeKeyPair(): Promise<void> {
    try {
      // Check if we have a key pair in local storage
      const storedKeyPair = localStorage.getItem('encryption_key_pair');
      
      if (storedKeyPair) {
        // Import stored key pair
        this.keyPair = await this.importKeyPair(JSON.parse(storedKeyPair));
      } else {
        // Generate new key pair
        this.keyPair = await this.generateKeyPair();
        
        // Export and store key pair
        const exportedKeyPair = await this.exportKeyPair(this.keyPair);
        localStorage.setItem('encryption_key_pair', JSON.stringify(exportedKeyPair));
      }
    } catch (error) {
      console.error('Error initializing key pair:', error);
    }
  }
  
  // Generate key pair
  private async generateKeyPair(): Promise<KeyPair> {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      true,
      ['deriveKey', 'deriveBits']
    );
    
    return {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
    };
  }
  
  // Export key pair
  private async exportKeyPair(keyPair: KeyPair): Promise<{ publicKey: string; privateKey: string }> {
    const exportedPublicKey = await window.crypto.subtle.exportKey(
      'spki',
      keyPair.publicKey
    );
    
    const exportedPrivateKey = await window.crypto.subtle.exportKey(
      'pkcs8',
      keyPair.privateKey
    );
    
    return {
      publicKey: this.arrayBufferToBase64(exportedPublicKey),
      privateKey: this.arrayBufferToBase64(exportedPrivateKey),
    };
  }
  
  // Import key pair
  private async importKeyPair(exportedKeyPair: { publicKey: string; privateKey: string }): Promise<KeyPair> {
    const publicKey = await window.crypto.subtle.importKey(
      'spki',
      this.base64ToArrayBuffer(exportedKeyPair.publicKey),
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      true,
      []
    );
    
    const privateKey = await window.crypto.subtle.importKey(
      'pkcs8',
      this.base64ToArrayBuffer(exportedKeyPair.privateKey),
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      true,
      ['deriveKey', 'deriveBits']
    );
    
    return {
      publicKey,
      privateKey,
    };
  }
  
  // Get public key
  public async getPublicKey(): Promise<string> {
    if (!this.keyPair) {
      await this.initializeKeyPair();
    }
    
    if (!this.keyPair) {
      throw new Error('Key pair not initialized');
    }
    
    const exportedPublicKey = await window.crypto.subtle.exportKey(
      'spki',
      this.keyPair.publicKey
    );
    
    return this.arrayBufferToBase64(exportedPublicKey);
  }
  
  // Derive shared secret
  private async deriveSharedSecret(publicKey: PublicKey, privateKey: PrivateKey): Promise<SymmetricKey> {
    const sharedSecret = await window.crypto.subtle.deriveKey(
      {
        name: 'ECDH',
        public: publicKey,
      },
      privateKey,
      {
        name: 'AES-GCM',
        length: 256,
      },
      false,
      ['encrypt', 'decrypt']
    );
    
    return sharedSecret;
  }
  
  // Establish session
  public async establishSession(userId: string, publicKeyBase64: string): Promise<void> {
    if (!this.keyPair) {
      await this.initializeKeyPair();
    }
    
    if (!this.keyPair) {
      throw new Error('Key pair not initialized');
    }
    
    // Import public key
    const publicKey = await window.crypto.subtle.importKey(
      'spki',
      this.base64ToArrayBuffer(publicKeyBase64),
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      true,
      []
    );
    
    // Derive shared secret
    const sharedSecret = await this.deriveSharedSecret(publicKey, this.keyPair.privateKey);
    
    // Store session key
    this.sessionKeys.set(userId, sharedSecret);
  }
  
  // Encrypt message
  public async encryptMessage(userId: string, message: string): Promise<string> {
    // Get session key
    const sessionKey = this.sessionKeys.get(userId);
    
    if (!sessionKey) {
      throw new Error('Session not established');
    }
    
    // Generate IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt message
    const encodedMessage = new TextEncoder().encode(message);
    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      sessionKey,
      encodedMessage
    );
    
    // Create encrypted message
    const encryptedMessage: EncryptedMessage = {
      iv: this.arrayBufferToBase64(iv),
      ephemeralPublicKey: '', // Not used in this simplified implementation
      ciphertext: this.arrayBufferToBase64(ciphertext),
      mac: '', // Not used in this simplified implementation
    };
    
    return JSON.stringify(encryptedMessage);
  }
  
  // Decrypt message
  public async decryptMessage(userId: string, encryptedMessageString: string): Promise<string> {
    // Get session key
    const sessionKey = this.sessionKeys.get(userId);
    
    if (!sessionKey) {
      throw new Error('Session not established');
    }
    
    // Parse encrypted message
    const encryptedMessage: EncryptedMessage = JSON.parse(encryptedMessageString);
    
    // Decrypt message
    const iv = this.base64ToArrayBuffer(encryptedMessage.iv);
    const ciphertext = this.base64ToArrayBuffer(encryptedMessage.ciphertext);
    
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      sessionKey,
      ciphertext
    );
    
    return new TextDecoder().decode(decrypted);
  }
  
  // Helper: Convert ArrayBuffer to Base64
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  
  // Helper: Convert Base64 to ArrayBuffer
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

// Export singleton instance
export const encryptionService = EncryptionService.getInstance();
