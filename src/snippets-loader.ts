import { Contents } from '@jupyterlab/services';
import { showErrorMessage } from '@jupyterlab/apputils';
import { SnippetMap } from './types';

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
): Promise<SnippetMap | null> => {
  try {
    const file = await contents.get(relativePath, {
      type: 'file',
      format: 'text',
      content: true
    });

    const customSnippetsJson = file.content as string;
    if (!customSnippetsJson) {
      return null;
    }

    let result: unknown;
    try {
      result = JSON.parse(customSnippetsJson);
    } catch {
      showErrorMessage(
        'Bad file format',
        "The snippets file's content is not valid JSON format."
      );
      return null;
    }

    validateSnippets(result);

    return result as SnippetMap;
  } catch (err: unknown) {
    const error = err as {
      response?: { status?: number };
      message?: string;
    };

    if (error.response?.status === 404) {
      showErrorMessage(
        'Snippets Not Found',
        `The snippets file was not found at: ${relativePath}`
      );
    } else {
      showErrorMessage(
        'Snippets Error',
        `Failed to fetch snippets file due to the following error: ${String(error.message || err)}`
      );
    }
    return null;
  }
};
