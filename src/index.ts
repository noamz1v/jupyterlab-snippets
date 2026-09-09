import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { INotebookTracker } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { createSnippetsButton } from './ui';

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
    console.log('jupyterlab-snippets settings loaded:', settings.composite);

    const snippetsButton = createSnippetsButton(app, tracker, settings);

    const SNIPPETS_BUTTON_POSITION = 10;

    tracker.widgetAdded.connect((sender, panel) => {
      void panel.context.ready.then(() => {
        panel.toolbar.insertItem(
          SNIPPETS_BUTTON_POSITION,
          'snippetsButton',
          snippetsButton
        );
      });
    });
  }
};

export default plugin;
