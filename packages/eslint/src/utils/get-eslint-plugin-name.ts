export function getESLintPluginName(projectName: string): string {
  const [first, second] = projectName.split('/');

  if (second) {
    return `${first}/${getESLintPluginName(second)}`;
  }

  if (projectName.startsWith('eslint-plugin')) {
    return projectName;
  }

  return `eslint-plugin-${projectName}`;
}
