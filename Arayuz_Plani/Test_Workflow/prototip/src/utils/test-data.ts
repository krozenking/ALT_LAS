// src/utils/test-data.ts

/**
 * Test veri yönetimi için yardımcı fonksiyonlar
 */

import { DropdownOption } from '../components/Dropdown';

/**
 * Kullanıcı verileri
 */
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Form verileri
 */
export interface FormData {
  name: string;
  email: string;
  country: string;
  agreeTerms: boolean;
}

/**
 * Ülke seçenekleri
 */
export const countryOptions: DropdownOption[] = [
  { value: 'tr', label: 'Türkiye' },
  { value: 'us', label: 'Amerika Birleşik Devletleri' },
  { value: 'gb', label: 'Birleşik Krallık' },
  { value: 'de', label: 'Almanya' },
  { value: 'fr', label: 'Fransa' },
];

/**
 * Test kullanıcıları
 */
export const testUsers: Record<string, User> = {
  admin: {
    id: '1',
    username: 'admin',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  },
  user: {
    id: '2',
    username: 'user',
    name: 'Regular User',
    email: 'user@example.com',
    role: 'user',
  },
  guest: {
    id: '3',
    username: 'guest',
    name: 'Guest User',
    email: 'guest@example.com',
    role: 'guest',
  },
};

/**
 * Geçerli form verileri oluşturur
 * @returns Geçerli form verileri
 */
export const createValidFormData = (): FormData => {
  return {
    name: 'Test User',
    email: 'test@example.com',
    country: 'tr',
    agreeTerms: true,
  };
};

/**
 * Geçersiz form verileri oluşturur
 * @param invalidFields Geçersiz alanlar
 * @returns Geçersiz form verileri
 */
export const createInvalidFormData = (invalidFields: Partial<Record<keyof FormData, boolean>> = {}): FormData => {
  const formData = createValidFormData();
  
  if (invalidFields.name) {
    formData.name = '';
  }
  
  if (invalidFields.email) {
    formData.email = 'invalid-email';
  }
  
  if (invalidFields.country) {
    formData.country = '';
  }
  
  if (invalidFields.agreeTerms) {
    formData.agreeTerms = false;
  }
  
  return formData;
};

/**
 * Rastgele bir kullanıcı adı oluşturur
 * @returns Rastgele kullanıcı adı
 */
export const generateRandomUsername = (): string => {
  return `user_${Math.random().toString(36).substring(2, 10)}`;
};

/**
 * Rastgele bir e-posta adresi oluşturur
 * @returns Rastgele e-posta adresi
 */
export const generateRandomEmail = (): string => {
  return `test_${Math.random().toString(36).substring(2, 10)}@example.com`;
};

/**
 * Rastgele bir kullanıcı oluşturur
 * @param role Kullanıcı rolü
 * @returns Rastgele kullanıcı
 */
export const generateRandomUser = (role: string = 'user'): User => {
  const username = generateRandomUsername();
  return {
    id: Math.random().toString(36).substring(2, 10),
    username,
    name: `${username.charAt(0).toUpperCase()}${username.slice(1)}`,
    email: generateRandomEmail(),
    role,
  };
};

/**
 * Rastgele bir form verisi oluşturur
 * @returns Rastgele form verisi
 */
export const generateRandomFormData = (): FormData => {
  return {
    name: generateRandomUsername(),
    email: generateRandomEmail(),
    country: countryOptions[Math.floor(Math.random() * countryOptions.length)].value,
    agreeTerms: Math.random() > 0.5,
  };
};
