export interface StandaloneRuleGeneratorSchema {
  projectName?: string;
  sourceRoot?: string;
  ruleName: string;
  directory?: string;
  skipFormat?: boolean;
  skipDependencies?: boolean;
}
