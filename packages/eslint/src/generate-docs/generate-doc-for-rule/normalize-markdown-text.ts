/**
 * Escapes special markdown characters and normalizes indentation on non-markdown
 * text
 * @param text text to clean up
 * @returns cleaned up text
 */
export function normalizeMarkdownText(text: string): string {
  return text
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/#/g, '\\#')
    .split('\n')
    .map((l) => l.trim())
    .join('\n');
}
