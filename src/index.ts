import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { installSnippetsButton } from './snippets-button';


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
    const settings = await settingRegistry.load(plugin.id);

    installSnippetsButton({
      contents: app.serviceManager.contents,
      tracker,
      settings
    });
  }
};

export default plugin;
