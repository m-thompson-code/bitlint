export interface RuleGeneratorSchema {
    projectName: string;
    ruleName: string;
    directory?: string;
    skipFormat?: boolean;
    skipDependencies?: boolean;
}
