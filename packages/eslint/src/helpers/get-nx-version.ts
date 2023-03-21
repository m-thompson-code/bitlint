import { readRootPackageJson } from '@nrwl/devkit';

export const getNxVersion = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const packageJson = readRootPackageJson();

  const version = packageJson?.devDependencies?.nx ?? packageJson?.dependencies?.nx;

  if (!version) {
    throw new Error("Unable to find nx version of workspace");
  }

  return version;
}
