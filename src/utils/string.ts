export function filterControlCharacters(str: string): string {
  return str.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
}
