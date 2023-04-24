import { readFileSync } from 'fs';
import * as ts from 'typescript';
import type { TSESLint } from '@typescript-eslint/utils';
import { RuleFileInfo } from '../gather-rule-file-info';

export interface ValidCase {
  name: string;
  code: string;
}

export interface InvalidCase {
  name: string;
  code: string;
}

export interface RuleData {
  name: string;
  files: RuleFileInfo;
  validCases: ValidCase[];
  invalidCases: InvalidCase[];
  description?: string;
  type: string;
  // TODO: consider supporting schema rule config options
}

// TODO: update args jsdocs
/**
 * Read rule and test data and return it so it can be used to generated documentation
 * @param ruleInfo
 * @returns Rule Data object indicating valid and invalid cases, name, and file info
 */
export function getRuleData(ruleInfo: RuleFileInfo, tsconfig?: string): RuleData {
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
