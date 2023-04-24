// TODO: update args jsdocs

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { normalizeCodeBlockIndentation } from "./normalize-code-block-indentation";
import { normalizeMarkdownText } from "./normalize-markdown-text";
import { RuleData } from "../get-rule-data/get-rule-data";

/**
 * Generate markdown documentation for given rule
 * (Goes to path stored in outputPath)
 * @param ruleData RuleData object to generate documentation from
 */
export function generateDocForRule(ruleData: RuleData, outputPath: string) {
  const valid = ruleData.validCases.map((testCase) => {
    return `### ${testCase.name}

\`\`\`ts
${normalizeCodeBlockIndentation(testCase.code)}
\`\`\`

`;
  }).join(`
`);

  const invalid = ruleData.invalidCases.map((testCase) => {
    return `### ${testCase.name}

\`\`\`ts
${normalizeCodeBlockIndentation(testCase.code)}
\`\`\`

`;
  }).join(`
`);

  const md = `# Rule \`${ruleData.name}\`

${normalizeMarkdownText(ruleData.description ?? '')}

## Valid Usage

${valid ? valid : 'No test cases'}

## Invalid Usage

${invalid ? invalid : 'No test cases'}
`;

  if (!existsSync(outputPath)) {
    mkdirSync(outputPath, { recursive: true });
  }

  writeFileSync(join(outputPath, `${ruleData.files.baseName}.md`), md);
}
