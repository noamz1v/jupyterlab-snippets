import { Contents } from '@jupyterlab/services';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { SnippetMap } from './types';
import { readSnippetsPath } from './settings';

/**
 * A failure encountered while reading the snippets file that the user
 * should be told about: `summary` names it, `detail` explains it.
 */
export type SnippetsFileError = {
  readonly summary: string;
  readonly detail: string;
};

/** Outcome of {@link resolveConfiguredSnippets}. */
export type SnippetsFileResult = {
  /**
   * The parsed snippet map, or `null` when the file was missing, empty,
   * or failed validation.
   */
  readonly snippets: SnippetMap | null;
  /**
   * A failure to report to the user, or `null` when there is nothing to
   * report (a successful load, or an empty file).
   */
  readonly error: SnippetsFileError | null;
};

const INVALID_SNIPPETS_MESSAGE =
  'Snippets file is invalid. Expected a JSON object where each key is a non-empty string and each value is a string of code.\n\nExample: { "Example Snippet": "print(\\"hello world\\")" }';

/** Assert that a parsed JSON value has the shape of a {@link SnippetMap}. */
function assertSnippetMap(value: unknown): asserts value is SnippetMap {
  const isSnippetMap =
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.entries(value).every(
      ([key, entry]) =>
        typeof key === 'string' &&
        key.trim() !== '' &&
        typeof entry === 'string'
    );

  if (!isSnippetMap) {
    throw new Error(INVALID_SNIPPETS_MESSAGE);
  }
}

/** Turn an error thrown while fetching or validating the file into a report. */
const describeLoadFailure = (
  err: unknown,
  relativePath: string
): SnippetsFileError => {
  const response = (err as { response?: { status?: number } }).response;
  if (response?.status === 404) {
    return {
      summary: 'file not found',
      detail: `The snippets file was not found at: ${relativePath}`
    };
  }

  const message = (err as { message?: string }).message;
  return {
    summary: 'could not read file',
    detail: `Failed to fetch snippets file due to the following error: ${String(message || err)}`
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
      return {
        snippets: null,
        error: {
          summary: 'invalid JSON',
          detail: "The snippets file's content is not valid JSON format."
        }
      };
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
    return {
      snippets: null,
      error: {
        summary: 'no file configured',
        detail:
          'Unable to find custom snippets file path, did you forget to define one in the settings?'
      }
    };
  }

  return loadSnippets(contents, path);
};
