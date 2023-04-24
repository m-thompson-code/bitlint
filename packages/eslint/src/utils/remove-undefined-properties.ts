import { keys } from "./keys";

/**
 * Removes undefined properties from object
 */
export function removeUndefinedProperties<T>(obj: T): void {
  keys(obj).forEach(key => {
    if (typeof obj[key] === 'undefined') {
      delete obj[key];
    }
  });
}
