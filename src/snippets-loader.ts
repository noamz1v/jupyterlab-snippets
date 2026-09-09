import { Contents } from '@jupyterlab/services';
import { SnippetMap } from './types';

/**
 * A failure encountered while reading the snippets file that the user
 * should be told about.
 */
export type SnippetsFileError = {
  readonly title: string;
  readonly message: string;
};

/** Outcome of {@link loadSnippetsFromClientFile}. */
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

const validateSnippets = (result: unknown): void => {
  const isValid =
    typeof result === 'object' &&
    result !== null &&
    !Array.isArray(result) &&
    Object.entries(result).every(
      ([key, value]) =>
        typeof key === 'string' &&
        key.trim() !== '' &&
        typeof value === 'string'
    );

  if (!isValid) {
    throw new Error(
      'Snippets file is invalid. Expected a JSON object where each key is a non-empty string and each value is a string of code.\n\nExample: { "Example Snippet": "print(\\"hello world\\")" }'
    );
  }
};

export const loadSnippetsFromClientFile = async (
  contents: Contents.IManager,
  relativePath: string
): Promise<SnippetsFileResult> => {
  try {
    const file = await contents.get(relativePath, {
      type: 'file',
      format: 'text',
      content: true
    });

    const customSnippetsJson = file.content as string;
    if (!customSnippetsJson) {
      return { snippets: null, error: null };
    }

    let result: unknown;
    try {
      result = JSON.parse(customSnippetsJson);
    } catch {
      return {
        snippets: null,
        error: {
          title: 'Bad file format',
          message: "The snippets file's content is not valid JSON format."
        }
      };
    }

    validateSnippets(result);

    return { snippets: result as SnippetMap, error: null };
  } catch (err: unknown) {
    const error = err as {
      response?: { status?: number };
      message?: string;
    };

    if (error.response?.status === 404) {
      return {
        snippets: null,
        error: {
          title: 'Snippets Not Found',
          message: `The snippets file was not found at: ${relativePath}`
        }
      };
    }

    return {
      snippets: null,
      error: {
        title: 'Snippets Error',
        message: `Failed to fetch snippets file due to the following error: ${String(error.message || err)}`
      }
    };
  }
};
