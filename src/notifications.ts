import { showErrorMessage } from '@jupyterlab/apputils';

/**
 * Show an error dialog in the extension's house style: the title is
 * always `Snippets Error: <summary>` and `detail` is the body.
 */
export const notifySnippetError = (summary: string, detail: string): void => {
  void showErrorMessage(`Snippets Error: ${summary}`, detail);
};
