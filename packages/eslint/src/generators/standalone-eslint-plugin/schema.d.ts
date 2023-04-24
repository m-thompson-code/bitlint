export interface StandaloneEslintPluginGeneratorSchema {
  pluginName: string;
  directory?: string;
  jestPreset?: string;
  rootEslintConfig?: string;
  baseTsConfig?: string;
  skipFormat?: boolean;
}
