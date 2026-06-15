import { CLIENT_VALIDATION } from '../constants';

/**
 * Truncates text to a maximum length, appending ellipsis if truncated.
 */
export function truncateText(
  text: string,
  maxLength: number = CLIENT_VALIDATION.CONTENT_PREVIEW.MAX_LENGTH,
): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Wraps all occurrences of a search term in <mark> tags for highlighting.
 */
export function highlightText(text: string, searchTerm: string): string {
  if (!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
