/**
 * Tip güvenliği için yardımcı fonksiyonlar
 * Bu modül, tip kontrolü ve güvenliği için kullanılan yardımcı fonksiyonları içerir.
 */

import { IMessage, IUser, IFileMetadata, IAIModel } from '../types';

/**
 * Bir değerin tanımlı olup olmadığını kontrol eder
 * @param value Kontrol edilecek değer
 * @returns Değer tanımlı ise true, değilse false
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Bir değerin string olup olmadığını kontrol eder
 * @param value Kontrol edilecek değer
 * @returns Değer string ise true, değilse false
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Bir değerin number olup olmadığını kontrol eder
 * @param value Kontrol edilecek değer
 * @returns Değer number ise true, değilse false
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Bir değerin boolean olup olmadığını kontrol eder
 * @param value Kontrol edilecek değer
 * @returns Değer boolean ise true, değilse false
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Bir değerin object olup olmadığını kontrol eder
 * @param value Kontrol edilecek değer
 * @returns Değer object ise true, değilse false
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Bir değerin array olup olmadığını kontrol eder
 * @param value Kontrol edilecek değer
 * @returns Değer array ise true, değilse false
 */
export function isArray<T>(value: unknown): value is Array<T> {
  return Array.isArray(value);
}

/**
 * Bir değerin Message tipinde olup olmadığını kontrol eder
 * @param value Kontrol edilecek değer
 * @returns Değer Message tipinde ise true, değilse false
 */
export function isMessage(value: unknown): value is IMessage {
  if (!isObject(value)) return false;

  return (
    isString((value as IMessage).id) &&
    isString((value as IMessage).content) &&
    ['user', 'ai'].includes((value as IMessage).sender) &&
    isString((value as IMessage).timestamp)
  );
}

/**
 * Bir değerin User tipinde olup olmadığını kontrol eder
 * @param value Kontrol edilecek değer
 * @returns Değer User tipinde ise true, değilse false
 */
export function isUser(value: unknown): value is IUser {
  if (!isObject(value)) return false;

  return (
    isString((value as IUser).id) &&
    isString((value as IUser).name)
  );
}

/**
 * Bir değerin FileMetadata tipinde olup olmadığını kontrol eder
 * @param value Kontrol edilecek değer
 * @returns Değer FileMetadata tipinde ise true, değilse false
 */
export function isFileMetadata(value: unknown): value is IFileMetadata {
  if (!isObject(value)) return false;

  return (
    isString((value as IFileMetadata).name) &&
    isString((value as IFileMetadata).type) &&
    isNumber((value as IFileMetadata).size)
  );
}

/**
 * Bir değerin AIModel tipinde olup olmadığını kontrol eder
 * @param value Kontrol edilecek değer
 * @returns Değer AIModel tipinde ise true, değilse false
 */
export function isAIModel(value: unknown): value is IAIModel {
  if (!isObject(value)) return false;

  return (
    isString((value as IAIModel).id) &&
    isString((value as IAIModel).type) &&
    isString((value as IAIModel).modelName)
  );
}

/**
 * Bir değeri güvenli bir şekilde belirli bir tipe dönüştürür
 * @param value Dönüştürülecek değer
 * @param defaultValue Dönüştürme başarısız olursa kullanılacak varsayılan değer
 * @returns Dönüştürülmüş değer veya varsayılan değer
 */
export function safelyParseJSON<T>(value: string, defaultValue: T): T {
  try {
    return JSON.parse(value) as T;
  } catch (_) {
    return defaultValue;
  }
}

/**
 * Bir değeri güvenli bir şekilde string'e dönüştürür
 * @param value Dönüştürülecek değer
 * @returns String değer
 */
export function safelyStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch (_) {
    return '';
  }
}
