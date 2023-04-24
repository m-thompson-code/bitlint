
import { getDefaultTsConfig } from './utils.ts/get-default-tsconfig';
import { gatherRuleFileInfo } from './gather-rule-file-info';
import { getRuleData } from './get-rule-data/get-rule-data';
import { generateDocForRule } from './generate-doc-for-rule';

// TODO: update args in jsdocs
/**
 * Generate documentation for rules described in an array of RuleFileInfo objects
 * @param ruleFileInfo file info objects for rules to generate docs for
 * @param verbose if true, show success/fail console message (default false)
 */
export function generateDocs(
  inputPath: string,
  outputPath: string,
  tsconfig = getDefaultTsConfig(inputPath),
  verbose = false
) {
  const ruleFileInfo = gatherRuleFileInfo(
    inputPath
  );

  for (const rule of ruleFileInfo) {
    try {
      const data = getRuleData(rule, tsconfig);

      generateDocForRule(data, outputPath);
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
