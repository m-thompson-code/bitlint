import { generateFiles, joinPathFragments, Tree, updateJson } from "@nrwl/devkit";
import { getRelativePath } from "../../../utils/get-relative-path";
import { join } from "path";
import { NormalizedSchema } from "./normalized-schema";

interface TsConfig {
  extends?: string;
  compileOnSave?: false,
  compilerOptions: Record<string, boolean | string | string[]>,
  exclude?: string[],
}

export function createTsConfig(tree: Tree, options: NormalizedSchema): void {
  const templateOptions = {
    ...options,
    tsConfigDist: getRelativePath('dist/out-tsc', options.projectRoot),
    template: '',
  };

  generateFiles(
    tree,
    join(__dirname, '../files/tsconfig-template'),
    options.projectRoot,
    templateOptions
  );

  const path = joinPathFragments(options.projectRoot, 'tsconfig.json');

  updateJson(tree, path, (json) => {
    if (options.baseTsConfig) {
      return getConfig(json, getRelativePath(options.projectRoot, options.baseTsConfig));
    } else {
      return getConfig(json);
    }
  });
}

function getConfig(config: TsConfig, baseTsConfigPath?: string): TsConfig {
  if (baseTsConfigPath) {
    return getProjectConfig(config, baseTsConfigPath);
  }

  return getRootConfig(config);
}

function getProjectConfig(config: TsConfig, baseTsConfigPath: string): TsConfig {
  const { ...rest } = config;

    // Remove any existing extends property
    if ('extends' in rest) {
      delete rest.extends;
    }

    return {
      // Make sure extends is at the top of file
      extends: baseTsConfigPath,
      ...rest,
    };
}

function getRootConfig(config: TsConfig): TsConfig {
  return {
    ...config,
    compileOnSave: false,
    compilerOptions: {
      rootDir: ".",
      sourceMap: true,
      declaration: false,
      moduleResolution: "node",
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      importHelpers: true,
      target: "es2015",
      module: "esnext",
      lib: ["es2017", "dom"],
      skipLibCheck: true,
      skipDefaultLibCheck: true,
      baseUrl: ".",
      ...config.compilerOptions,
    },
    exclude: ["node_modules", "tmp"]
  }
}
