import { showErrorMessage } from '@jupyterlab/apputils';

/**
 * Show an error dialog: the title is `Snippets Error: <summary>`
 * and `detail` is the body.
 */
export const notifySnippetError = (summary: string, detail: string): void => {
  void showErrorMessage(`Snippets Error: ${summary}`, detail);
};
