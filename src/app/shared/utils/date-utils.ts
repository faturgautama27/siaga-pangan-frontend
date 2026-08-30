/**
 * Date utility functions untuk fix timezone issues
 * 
 * Problem: JavaScript Date dengan timezone lokal (WIB/UTC+7) ketika di-convert
 * ke ISO string akan bergeser ke UTC, menyebabkan tanggal backdate 1 hari.
 * 
 * Example:
 * User pilih: 15 Agustus 2026 (di UI)
 * Date object: 2026-08-15T00:00:00.000+07:00 (WIB)
 * toISOString(): 2026-08-14T17:00:00.000Z (UTC) ← BACKDATE!
 * API receives: 2026-08-14 ← WRONG!
 * 
 * Solution: Format tanggal secara manual tanpa konversi timezone
 */

/**
 * Format Date object ke string YYYY-MM-DD tanpa konversi timezone
 * Menggunakan local date components, bukan UTC
 * 
 * @param date Date object from datepicker
 * @returns String format YYYY-MM-DD (local date, bukan UTC)
 * 
 * @example
 * const date = new Date('2026-08-15'); // User pilih 15 Agustus
 * formatDateToYYYYMMDD(date); // Returns: "2026-08-15" ✅
 * // NOT "2026-08-14" ❌
 */
export function formatDateToYYYYMMDD(date: Date | null | undefined): string {
  if (!date) {
    return new Date().toLocaleDateString('en-CA'); // fallback today (en-CA = YYYY-MM-DD)
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Parse string YYYY-MM-DD ke Date object (local timezone)
 * Menghindari timezone conversion saat parsing
 * 
 * @param dateStr String format YYYY-MM-DD
 * @returns Date object with local timezone (not UTC)
 * 
 * @example
 * parseYYYYMMDD('2026-08-15'); // Returns: Date object for 15 Aug 2026 00:00 (local)
 */
export function parseYYYYMMDD(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

/**
 * Format Date object ke DD/MM/YYYY untuk display
 * 
 * @param date Date object
 * @returns String format DD/MM/YYYY
 * 
 * @example
 * formatDateToDDMMYYYY(new Date('2026-08-15')); // Returns: "15/08/2026"
 */
export function formatDateToDDMMYYYY(date: Date | null | undefined): string {
  if (!date) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Get today's date as YYYY-MM-DD string (local timezone)
 * 
 * @returns Today's date in YYYY-MM-DD format
 */
export function getTodayYYYYMMDD(): string {
  return formatDateToYYYYMMDD(new Date());
}

/**
 * Check if two dates are the same day (ignore time)
 * 
 * @param date1 First date
 * @param date2 Second date
 * @returns true if same day, false otherwise
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
