import { ToolbarButton } from '@jupyterlab/apputils';

import { SnippetMenuContext, showSnippetMenu } from './show-snippet-menu';

/** Name the Snippets button is registered under in a notebook toolbar. */
const TOOLBAR_ITEM_NAME = 'snippetsButton';

/** Position of the Snippets button within a notebook toolbar. */
const TOOLBAR_ITEM_RANK = 10;

/** Create a "Snippets" toolbar button that opens the snippet menu on click. */
const createSnippetsButton = (context: SnippetMenuContext): ToolbarButton => {
  const button = new ToolbarButton({
    label: 'Snippets',
    tooltip: 'Open snippet menu',
    onClick: () => void showSnippetMenu(button.node, context)
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
