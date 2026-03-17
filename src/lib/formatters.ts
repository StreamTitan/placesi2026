/**
 * Formats a phone number by separating the country code from the rest of the number
 * Example: "18687451669" -> "1868 745 1669"
 *
 * @param phone - The phone number string to format
 * @returns Formatted phone number with country code separated
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';

  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 0) return phone;

  // Handle 11-digit numbers (assuming first 4 digits are country code like 1868)
  if (digits.length === 11) {
    const countryCode = digits.slice(0, 4);
    const firstPart = digits.slice(4, 7);
    const secondPart = digits.slice(7);
    return `${countryCode} ${firstPart} ${secondPart}`;
  }

  // Handle 10-digit numbers (assuming first 3 digits might be area code)
  if (digits.length === 10) {
    const firstPart = digits.slice(0, 3);
    const secondPart = digits.slice(3, 6);
    const thirdPart = digits.slice(6);
    return `${firstPart} ${secondPart} ${thirdPart}`;
  }

  // For other lengths, return the original phone
  return phone;
}
