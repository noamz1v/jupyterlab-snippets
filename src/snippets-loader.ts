import { Contents } from '@jupyterlab/services';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { readSnippetsPath } from './settings';
import {
  SnippetsFileError,
  SnippetsFileResult,
  failure
} from './snippets-file-result';
import { assertSnippetMap } from './validate-snippet-map';

/** Turn an error thrown while fetching or validating the file into a report. */
const describeLoadFailure = (
  err: unknown,
  relativePath: string
): SnippetsFileError => {
  const view = err as { response?: { status?: number }; message?: string };

  if (view.response?.status === 404) {
    return {
      summary: 'file not found',
      detail: `The snippets file was not found at: ${relativePath}`
    };
  }

  return {
    summary: 'could not read file',
    detail: `Failed to fetch snippets file due to the following error: ${String(view.message || err)}`
  };
};

const loadSnippets = async (
  contents: Contents.IManager,
  relativePath: string
): Promise<SnippetsFileResult> => {
  try {
    const file = await contents.get(relativePath, {
      type: 'file',
      format: 'text',
      content: true
    });

    const raw = file.content as string;
    if (!raw) {
      return { snippets: null, error: null };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return failure(
        'invalid JSON',
        "The snippets file's content is not valid JSON format."
      );
    }

    assertSnippetMap(parsed);

    return { snippets: parsed, error: null };
  } catch (err: unknown) {
    return { snippets: null, error: describeLoadFailure(err, relativePath) };
  }
};

/**
 * Load the snippet map from the file named by the `custom_snippets_path`
 * setting, or return a failure describing why it could not be loaded.
 */
export const resolveConfiguredSnippets = async (
  contents: Contents.IManager,
  settings: ISettingRegistry.ISettings
): Promise<SnippetsFileResult> => {
  const path = readSnippetsPath(settings);
  if (!path) {
    return failure(
      'no file configured',
      'Unable to find custom snippets file path, did you forget to define one in the settings?'
    );
  }

  return loadSnippets(contents, path);
};
