import { SnippetMap } from './types';

const INVALID_SNIPPETS_MESSAGE =
  'Snippets file is invalid. Expected a JSON object where each key is a non-empty string and each value is a string of code.\n\nExample: { "Example Snippet": "print(\\"hello world\\")" }';

/** Assert that a parsed JSON value has the shape of a {@link SnippetMap}. */
export function assertSnippetMap(value: unknown): asserts value is SnippetMap {
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
