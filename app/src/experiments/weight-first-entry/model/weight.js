/**
 * Проверяет введённый вес и возвращает подпись в килограммах с десятичной запятой.
 * @param {string} draft — содержимое поля, в том числе незавершённое число.
 * @returns {string | null} Число для отображения или null при ошибке ввода.
 */
export function parseWeight(draft) {
  const entered = draft.trim();
  if (!/^\d+(?:[.,]\d+)?$/.test(entered)) return null;

  const decimal = entered.replace(',', '.');
  const weight = Number(decimal);
  if (!Number.isFinite(weight) || weight <= 0) return null;

  const [integer, fraction] = decimal.split('.');
  return [integer.replace(/^0+(?=\d)/, ''), fraction].filter(Boolean).join(',');
}
