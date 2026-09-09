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
 * Initialization data for the jupyterlab-snippets extension.
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
          createSnippetsButton(app, tracker, settings)
        );
      });
    });
  }
};

export default plugin;
