/**
 * Format a date to a string in the format "DD.MM.YYYY"
 * If the date is today, return "Bugün"
 * If the date is yesterday, return "Dün"
 */
export const formatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (isSameDay(date, today)) {
    return 'Bugün';
  } else if (isSameDay(date, yesterday)) {
    return 'Dün';
  } else {
    return `${padZero(date.getDate())}.${padZero(date.getMonth() + 1)}.${date.getFullYear()}`;
  }
};

/**
 * Format a date to a time string in the format "HH:MM"
 */
export const formatTime = (date: Date): string => {
  return `${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
};

/**
 * Format a date to a datetime string in the format "DD.MM.YYYY HH:MM"
 */
export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

/**
 * Pad a number with a leading zero if it's less than 10
 */
export const padZero = (num: number): string => {
  return num < 10 ? `0${num}` : `${num}`;
};
