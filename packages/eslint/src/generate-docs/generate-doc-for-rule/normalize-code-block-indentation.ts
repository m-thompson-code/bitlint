/**
 * Remove leading indentation on code block while maintaining overall
 * indentation. Also cleans up leading or trailing blank line
 * @param codeblock Code block to clean up
 * @returns cleaned-up code block string
 */
export function normalizeCodeBlockIndentation(codeblock: string): string {
  const indentSize = (line: string) => (line.match(/^[\s]+/) ?? [''])[0].length;
  const lines = codeblock
    .replace(/^\n/, '')
    .replace(/\n[\s]*$/, '')
    .split('\n');

  const minIndent = Math.min(...lines.filter((l) => l.length).map(indentSize));
  return lines.map((l) => l.substring(minIndent)).join('\n');
}
