export interface EslintPluginGeneratorSchema {
  pluginName: string;
  tags?: string;
  directory?: string;
  skipDependencies?: boolean;
  jestPreset?: string;
  rootEslintConfig?: string;
  baseTsConfig?: string;
  skipFormat?: boolean;
}
