export interface RuleGeneratorSchema {
  ruleName: string;
  projectName: string;
  index?: string;
  directory?: string;
  skipFormat?: boolean;
  skipDependencies?: boolean;
}
