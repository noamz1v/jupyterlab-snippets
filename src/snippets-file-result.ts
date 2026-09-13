import { SnippetMap } from './types';

/**
 * A failure encountered while reading the snippets file that the user
 * should be told about: `summary` names it, `detail` explains it.
 */
export type SnippetsFileError = {
  readonly summary: string;
  readonly detail: string;
};

/** Outcome of reading the configured snippets file. */
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

/** A {@link SnippetsFileResult} carrying only a failure to report. */
export const failure = (
  summary: string,
  detail: string
): SnippetsFileResult => ({
  snippets: null,
  error: { summary, detail }
});
