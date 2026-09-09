import { ISettingRegistry } from '@jupyterlab/settingregistry';

/** Settings key holding the path to the user's snippets file. */
const SNIPPETS_PATH_KEY = 'custom_snippets_path';

/** Read the configured snippets file path, or `null` if none is set. */
export const readSnippetsPath = (
  settings: ISettingRegistry.ISettings
): string | null => {
  const value = settings.get(SNIPPETS_PATH_KEY).composite;
  return typeof value === 'string' && value !== '' ? value : null;
};
