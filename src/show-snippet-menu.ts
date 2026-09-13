import { INotebookTracker } from '@jupyterlab/notebook';
import { Contents } from '@jupyterlab/services';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { Menu } from '@lumino/widgets';

import { resolveConfiguredSnippets } from './snippets-loader';
import { createSnippetMenu } from './snippet-menu';
import { notifySnippetError } from './notifications';

/** Services the snippet menu flow needs. */
export type SnippetMenuContext = {
  readonly contents: Contents.IManager;
  readonly tracker: INotebookTracker;
  readonly settings: ISettingRegistry.ISettings;
};

/** Open `menu` just below `anchor` and dispose it once it closes. */
const openMenuBelow = (menu: Menu, anchor: HTMLElement): void => {
  menu.aboutToClose.connect(() => {
    setTimeout(() => menu.dispose(), 0);
  });

  const { left, bottom } = anchor.getBoundingClientRect();
  menu.open(left, bottom);
};

/**
 * Open a menu of the configured snippets for the active notebook, anchored
 * beneath `anchor`. Any failure along the way is reported to the user and
 * no menu is shown.
 */
export const showSnippetMenu = async (
  anchor: HTMLElement,
  { contents, tracker, settings }: SnippetMenuContext
): Promise<void> => {
  const panel = tracker.currentWidget;
  if (!panel) {
    notifySnippetError('no active notebook', 'No active notebook found');
    return;
  }

  const { snippets, error } = await resolveConfiguredSnippets(
    contents,
    settings
  );
  if (error) {
    notifySnippetError(error.summary, error.detail);
    return;
  }
  // No error but nothing parsed: the file exists and is empty.
  if (!snippets) {
    notifySnippetError('no snippets available', 'No snippets were found');
    return;
  }

  openMenuBelow(createSnippetMenu(snippets, panel), anchor);
};
