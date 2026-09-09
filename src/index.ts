import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { createSnippetsButton } from './snippet-menu';

/** Name the Snippets button is registered under in a notebook toolbar. */
const TOOLBAR_ITEM_NAME = 'snippetsButton';

/** Position of the Snippets button within a notebook toolbar. */
const TOOLBAR_ITEM_RANK = 10;

/**
 * Adds a "Snippets" button to every notebook toolbar. The button opens a
 * menu of code snippets, read from the JSON file named by the
 * `custom_snippets_path` setting, and inserts the chosen one as a new
 * cell below the active cell.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-snippets:plugin',
  description:
    'A JupyterLab extension for managing custom snippets, compatible with JupyterLab 4.x.',
  autoStart: true,
  requires: [INotebookTracker, ISettingRegistry],

  activate: async (
    app: JupyterFrontEnd,
    tracker: INotebookTracker,
    settingRegistry: ISettingRegistry
  ) => {
    console.log('JupyterLab extension jupyterlab-snippets is activated!');

    const settings = await settingRegistry.load(plugin.id);

    // Give every notebook its own button instance: a Lumino widget can
    // only live in one parent, so a shared instance would hop to whichever
    // notebook opened last.
    tracker.widgetAdded.connect((_, panel) => {
      void panel.context.ready.then(() => {
        panel.toolbar.insertItem(
          TOOLBAR_ITEM_RANK,
          TOOLBAR_ITEM_NAME,
          createSnippetsButton(app.serviceManager.contents, tracker, settings)
        );
      });
    });
  }
};

export default plugin;
