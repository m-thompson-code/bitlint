export interface EslintPluginGeneratorSchema {
  name: string;
  tags?: string;
  directory?: string;
  skipDependencies?: boolean;
  skipNxProject?: boolean;
  jestPreset?: string;
  rootEslintConfig?: string;
  baseTsConfig?: string;
  skipPlaceholderRule?: boolean;
}
