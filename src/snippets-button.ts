import { INotebookTracker } from '@jupyterlab/notebook';
import { ToolbarButton } from '@jupyterlab/apputils';
import { Contents } from '@jupyterlab/services';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { buildSnippetMenu } from './snippet-menu';
import { notifySnippetError } from './notifications';

/** Name the Snippets button is registered under in a notebook toolbar. */
const TOOLBAR_ITEM_NAME = 'snippetsButton';

/** Position of the Snippets button within a notebook toolbar. */
const TOOLBAR_ITEM_RANK = 10;

/** Services the Snippets button needs to open its menu. */
export type SnippetMenuContext = {
  readonly contents: Contents.IManager;
  readonly tracker: INotebookTracker;
  readonly settings: ISettingRegistry.ISettings;
};

/**
 * Create a "Snippets" toolbar button. Clicking it opens a menu of the
 * configured snippets for the active notebook, anchored beneath the button.
 */
const createSnippetsButton = (context: SnippetMenuContext): ToolbarButton => {
  const { contents, tracker, settings } = context;

  const button = new ToolbarButton({
    label: 'Snippets',
    tooltip: 'Open snippet menu',
    onClick: async () => {
      const panel = tracker.currentWidget;
      if (!panel) {
        notifySnippetError('no active notebook', 'No active notebook found');
        return;
      }

      const menu = await buildSnippetMenu(contents, settings, panel);
      if (!menu) {
        notifySnippetError('no snippets available', 'No snippets were found');
        return;
      }

      menu.aboutToClose.connect(() => {
        setTimeout(() => menu.dispose(), 0);
      });

      const { left, bottom } = button.node.getBoundingClientRect();
      menu.open(left, bottom);
    }
  });

  return button;
};

/**
 * Add a Snippets button to every notebook toolbar, now and as new
 * notebooks open. Each notebook gets its own button instance: a Lumino
 * widget can live in only one parent.
 */
export const installSnippetsButton = (context: SnippetMenuContext): void => {
  context.tracker.widgetAdded.connect((_, panel) => {
    void panel.context.ready.then(() => {
      panel.toolbar.insertItem(
        TOOLBAR_ITEM_RANK,
        TOOLBAR_ITEM_NAME,
        createSnippetsButton(context)
      );
    });
  });
};
