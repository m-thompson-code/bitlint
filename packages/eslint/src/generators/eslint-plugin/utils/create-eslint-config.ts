import { joinPathFragments, Tree, writeJson } from "@nrwl/devkit";
import { getRelativePath } from "../../../utils/get-relative-path";
import { NormalizedSchema } from "./normalized-schema";

interface EslintConfig {
  root?: boolean;
  extends?: string[];
  ignorePatterns: string[];
  overrides: {
      files: string[];
      rules: Record<string, unknown>;
  }[];
}

export function createEslintConfig(tree: Tree, options: NormalizedSchema): void {
  const path = joinPathFragments(options.projectRoot, '.eslintrc.json');

  // Avoid creating eslint config since one already exists
  if (tree.exists(path)) {
    return;
  }

  if (options.rootEslintConfig) {
    writeJson(tree, path, getConfig(getRelativePath(options.projectRoot, options.rootEslintConfig)));
  } else {
    writeJson(tree, path, getConfig());
    // TODO: Create .eslintignore with node_modules if one doesn't exist already
  }
}

function getConfig(parentEslintPath?: string): EslintConfig {
  const baseConfig: EslintConfig = {
    ignorePatterns: ["!**/*"],
    overrides: [
      {
        files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
        rules: {}
      },
      {
        files: ["*.ts", "*.tsx"],
        rules: {}
      },
      {
        files: ["*.js", "*.jsx"],
        rules: {}
      }
    ]
  };

  if (parentEslintPath) {
    return {
      extends: [parentEslintPath],
      ...baseConfig,
    };
  } else {
    return {
      root: true,
      ...baseConfig,
    }
  }
}
