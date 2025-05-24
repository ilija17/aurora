// composables/useCrypto.ts
import { ref } from 'vue'

export const useCrypto = () => {
  const isSupported = ref(typeof window !== 'undefined' && 'crypto' in window && 'subtle' in window.crypto)

  // Derive encryption key from user password using PBKDF2
  async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    )

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // Strong iteration count
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }

  // Generate a random salt
  function generateSalt(): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(16))
  }

  // Generate a random IV
  function generateIV(): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(12))
  }

  // Encrypt text
  async function encryptText(plaintext: string, password: string): Promise<{
    ciphertext: string
    salt: string
    iv: string
  }> {
    if (!isSupported.value) {
      throw new Error('Web Crypto API not supported')
    }

    const encoder = new TextEncoder()
    const salt = generateSalt()
    const iv = generateIV()
    
    const key = await deriveKey(password, salt)
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encoder.encode(plaintext)
    )

    return {
      ciphertext: arrayBufferToBase64(encrypted),
      salt: arrayBufferToBase64(salt),
      iv: arrayBufferToBase64(iv)
    }
  }

  // Decrypt text
  async function decryptText(
    ciphertext: string,
    salt: string,
    iv: string,
    password: string
  ): Promise<string> {
    if (!isSupported.value) {
      throw new Error('Web Crypto API not supported')
    }

    const decoder = new TextDecoder()
    const saltArray = base64ToArrayBuffer(salt)
    const ivArray = base64ToArrayBuffer(iv)
    const ciphertextArray = base64ToArrayBuffer(ciphertext)
    
    const key = await deriveKey(password, new Uint8Array(saltArray))
    
    try {
      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: new Uint8Array(ivArray)
        },
        key,
        ciphertextArray
      )
      
      return decoder.decode(decrypted)
    } catch (error) {
      throw new Error('Decryption failed - invalid password or corrupted data')
    }
  }

  // Utility functions for base64 conversion
  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  return {
    isSupported,
    encryptText,
    decryptText
  }
}