export interface RuleGeneratorSchema {
    projectName?: string;
    sourceRoot?: string;
    ruleName: string;
    directory?: string;
    skipFormat?: boolean;
    skipDependencies?: boolean;
}
