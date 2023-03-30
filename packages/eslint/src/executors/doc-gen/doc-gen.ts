import { join } from 'path';
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  // readdirSync,
} from 'fs';
import * as ts from 'typescript';
import type { TSESLint } from '@typescript-eslint/utils';
import { gatherRuleFileInfoByGlob, RuleFileInfo } from './gather-rule-file-info';

// "cacheableOperations": ["build", "doc", "lint", "test", "e2e"],
// "inputs": ["!{projectRoot}/src/docs/**/*", "default", "^production"],

// TODO: Add logic for cleaning output directory
// TODO: Add configuration support

// const INPUT_PATH = join('/Users/markthompson/Documents/github/bitovi/temp-eslint/bitovi/tmp/nx-e2e/proj/libs/eslint6177853/src/rules');
// const OUTPUT_PATH = join('/Users/markthompson/Documents/github/bitovi/temp-eslint/bitovi/docs');

interface ValidCase {
  name: string;
  code: string;
}

interface InvalidCase {
  name: string;
  code: string;
}

interface RuleData {
  name: string;
  files: RuleFileInfo;
  validCases: ValidCase[];
  invalidCases: InvalidCase[];
  description?: string;
  type: string;
  // TODO: consider supporting schema rule config options
}

// /**
//  * Gather file info for all rules in given directory
//  * (Assumes filenames follow lower-snake-case.ts and lower-snake-case.spec.ts pattern)
//  * @param sourcePath Directory to scrape for rules
//  * @returns array of RuleFileInfo objects, which indicate the path to the rule's code and spec files
//  */
// function gatherRuleFileInfo(sourcePath: string): RuleFileInfo[] {
//   const files = readdirSync(sourcePath).filter((name) =>
//     name.match(/[a-z\-\.]+\.ts/)
//   );
//   const ruleFiles: string[] = [];
//   const specFiles: string[] = [];
//   files.forEach((file) => {
//     if (file.endsWith('.spec.ts')) {
//       specFiles.push(file);
//     } else {
//       ruleFiles.push(file);
//     }
//   });
//   const fileInfo: RuleFileInfo[] = ruleFiles
//     .filter((file) => {
//       const name = file.split('.')[0];
//       if (!specFiles.includes(`${name}.spec.ts`)) {
//         console.warn(`Couldn't find spec file for ${file}`);
//         return false;
//       }
//       return true;
//     })
//     .map((file) => ({
//       baseName: file.split('.')[0],
//       rule: join(sourcePath, file),
//       spec: join(sourcePath, `${file.split('.')[0]}.spec.ts`),
//     }));

//   return fileInfo;
// }

// TODO: update args jsdocs
/**
 * Read rule and test data and return it so it can be used to generated documentation
 * @param ruleInfo
 * @returns Rule Data object indicating valid and invalid cases, name, and file info
 */
function readRuleData(ruleInfo: RuleFileInfo, tsconfig: string): RuleData {
  // Parse rule test file
  const specRawSource = readFileSync(ruleInfo.spec, 'utf-8');
  const specSource = ts.createSourceFile(
    ruleInfo.spec,
    specRawSource,
    ts.ScriptTarget.Latest
  );

  const validCases: ValidCase[] = [];
  const invalidCases: InvalidCase[] = [];

  const findTestCases = (node: ts.Node) => {
    if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'valid' &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      // Found valid test cases array
      const validCaseNodes = node.initializer.elements;
      validCaseNodes.forEach((caseNode) => {
        if (!ts.isObjectLiteralExpression(caseNode)) {
          // not expected format
          return;
        }
        const nameNode = caseNode.properties.find(
          (prop) =>
            ts.isPropertyAssignment(prop) &&
            ts.isIdentifier(prop.name) &&
            prop.name.text === 'name'
        );
        const codeNode = caseNode.properties.find(
          (prop) =>
            ts.isPropertyAssignment(prop) &&
            ts.isIdentifier(prop.name) &&
            prop.name.text === 'code'
        );

        const caseInfo: ValidCase = {
          name: 'Unnamed',
          code: '',
        };

        if (
          nameNode &&
          ts.isPropertyAssignment(nameNode) &&
          ts.isStringLiteralLike(nameNode.initializer)
        ) {
          caseInfo.name = nameNode.initializer.text;
        } else {
          // No case name provided, so abort
          return;
        }

        if (
          codeNode &&
          ts.isPropertyAssignment(codeNode) &&
          ts.isStringLiteralLike(codeNode.initializer)
        ) {
          caseInfo.code = codeNode.initializer.text;
        } else {
          // No code provided, so abort
          return;
        }

        validCases.push(caseInfo);
      });
    }
    if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'invalid' &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      // Found invalid test cases array
      const invalidCaseNodes = node.initializer.elements;
      invalidCaseNodes.forEach((caseNode) => {
        if (ts.isObjectLiteralExpression(caseNode)) {
          // Object format case
          const nameNode = caseNode.properties.find(
            (prop) =>
              ts.isPropertyAssignment(prop) &&
              ts.isIdentifier(prop.name) &&
              prop.name.text === 'name'
          );
          const codeNode = caseNode.properties.find(
            (prop) =>
              ts.isPropertyAssignment(prop) &&
              ts.isIdentifier(prop.name) &&
              prop.name.text === 'code'
          );

          const caseInfo: InvalidCase = {
            name: 'Unnamed',
            code: '',
          };
          if (
            nameNode &&
            ts.isPropertyAssignment(nameNode) &&
            ts.isStringLiteralLike(nameNode.initializer)
          ) {
            caseInfo.name = nameNode.initializer.text;
          } else {
            // No case name provided, so abort
            return;
          }

          if (
            codeNode &&
            ts.isPropertyAssignment(codeNode) &&
            ts.isNoSubstitutionTemplateLiteral(codeNode.initializer)
          ) {
            caseInfo.code = codeNode.initializer.text;
          }

          if (caseInfo.code) {
            invalidCases.push(caseInfo);
          }
        }

        if (
          ts.isCallExpression(caseNode) &&
          ts.isIdentifier(caseNode.expression) &&
          caseNode.expression.text ===
            'convertAnnotatedSourceToFailureCase'
        ) {
          // Found call to convertAnnotatedSourceToFailureCase()
          const argsNode = caseNode.arguments[0];
          if (!ts.isObjectLiteralExpression(argsNode)) {
            // Arguments not as expected
            return;
          }

          const nameNode = argsNode.properties.find(
            (prop) =>
              ts.isPropertyAssignment(prop) &&
              ts.isIdentifier(prop.name) &&
              prop.name.text === 'description'
          );
          const codeNode = argsNode.properties.find(
            (prop) =>
              ts.isPropertyAssignment(prop) &&
              ts.isIdentifier(prop.name) &&
              prop.name.text === 'annotatedSource'
          );

          // TODO: handle extracting fix and suggestion info

          const caseInfo: InvalidCase = {
            name: 'Unnamed',
            code: '',
          };
          if (
            nameNode &&
            ts.isPropertyAssignment(nameNode) &&
            ts.isStringLiteralLike(nameNode.initializer)
          ) {
            caseInfo.name = nameNode.initializer.text;
          } else {
            // No name, so abort (shouldn't be reachable)
            return;
          }

          if (
            codeNode &&
            ts.isPropertyAssignment(codeNode) &&
            ts.isNoSubstitutionTemplateLiteral(codeNode.initializer)
          ) {
            caseInfo.code = codeNode.initializer.text;
          } else {
            // No code, so abort
            return;
          }

          invalidCases.push(caseInfo);
        }
      });
    }
    ts.forEachChild(node, findTestCases);
  };

  findTestCases(specSource);

  const dir = ruleInfo.rule;

  //
  // // Register plugin for TS transpilation
  // const registrationCleanup = registerTsProject(dir, tsconfig);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { register } = require('ts-node') as typeof import('ts-node');

  register({
    transpileOnly: true,
    project: tsconfig,
  });


  // Get rule file exports
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { rule, RULE_NAME } = require(dir);//await import(ruleInfo.rule);

  const ruleConfig = rule as TSESLint.RuleModule<string, []> & {
    defaultOptions?: Record<string, unknown>[];
  };

  return {
    name: RULE_NAME,
    files: ruleInfo,
    description: ruleConfig.meta.docs?.description,
    type: ruleConfig.meta.type,
    validCases,
    invalidCases,
  };
}

// TODO: update args jsdocs
/**
 * Generate markdown documentation for given rule
 * (Goes to path stored in outputPath)
 * @param ruleData RuleData object to generate documentation from
 */
function generateDocumentation(ruleData: RuleData, outputPath: string) {
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

// TODO: update args in jsdocs
/**
 * Generate documentation for rules described in an array of RuleFileInfo objects
 * @param ruleFileInfo file info objects for rules to generate docs for
 * @param verbose if true, show success/fail console message (default false)
 */
export function generateDocsForRules(
  inputPath: string,
  outputPath: string,
  tsconfig: string,
  verbose = false
) {
  const ruleFileInfo = gatherRuleFileInfoByGlob(
    inputPath
  );

  for (const rule of ruleFileInfo) {
    try {
      const data = readRuleData(rule, tsconfig);
      generateDocumentation(data, outputPath);
      verbose &&
        console.log(
          `✅ Generated documentation for \u001b[32m${data.name}\u001b[0m`
        );
    } catch (err) {
      verbose &&
        console.error(
          `❌ Failed to generate documentation for rule in \u001b[31m${rule.baseName}.ts\u001b[0m`
        );
        console.error(err);
    }
  }
}

/**
 * Remove leading indentation on code block while maintaining overall
 * indentation. Also cleans up leading or trailing blank line
 * @param codeblock Code block to clean up
 * @returns cleaned-up code block string
 */
function normalizeCodeBlockIndentation(codeblock: string): string {
  const indentSize = (line: string) => (line.match(/^[\s]+/) ?? [''])[0].length;
  const lines = codeblock
    .replace(/^\n/, '')
    .replace(/\n[\s]*$/, '')
    .split('\n');

  const minIndent = Math.min(...lines.filter((l) => l.length).map(indentSize));
  return lines.map((l) => l.substring(minIndent)).join('\n');
}

/**
 * Escapes special markdown characters and normalizes indentation on non-markdown
 * text
 * @param text text to clean up
 * @returns cleaned up text
 */
function normalizeMarkdownText(text: string): string {
  return text
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/#/g, '\\#')
    .split('\n')
    .map((l) => l.trim())
    .join('\n');
}

// -----

// generateDocsForRules(INPUT_PATH, OUTPUT_PATH, tsconfig, true).then(
//   () => {
//     console.log('Generated documentation successfully!');
//   },
//   (err) => {
//     console.error('Documentation generation failed:', err);
//   }
// );
