export function getEslintPluginName(projectName: string): string {
  const [first, second] = projectName.split('/');

  if (second) {
    return `${first}/${getEslintPluginName(second)}`;
  }

  if (projectName.startsWith('eslint-plugin')) {
    return projectName;
  }

  return `eslint-plugin-${projectName}`;
}
