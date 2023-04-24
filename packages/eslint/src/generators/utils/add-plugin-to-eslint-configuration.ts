import { Tree, updateJson } from '@nrwl/devkit';

export function addPluginToESLintConfiguration(tree: Tree, plugin: string, jsonPath: string): void {
  updateJson(tree, jsonPath, (json) => {
    const plugins = json.plugins ?? [];

    if (plugins.includes(plugin)) {
      return json;
    }

    return {
      ...json,
      plugins: [...plugins, plugin],
    };
  });
}

