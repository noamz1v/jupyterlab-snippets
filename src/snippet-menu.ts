import { JupyterFrontEnd } from '@jupyterlab/application';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { ToolbarButton, showErrorMessage } from '@jupyterlab/apputils';
import { Menu } from '@lumino/widgets';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { SnippetMap } from './types';
import { loadSnippetsFromClientFile } from './snippets-loader';
import { insertSnippetToCell, formatLabel } from './notebook-actions';
import { CommandRegistry } from '@lumino/commands';

/**
 * Populate `menu` with one item per snippet, registering a backing
 * command for each.
 *
 * @returns a function that disposes every command registered by this
 * call, to be run once the menu is no longer needed.
 */
export const addSnippetsToMenu = (
  commands: CommandRegistry,
  menu: Menu,
  snippets: SnippetMap,
  panel: NotebookPanel
): (() => void) => {
  const registered: { dispose(): void }[] = [];

  Object.entries(snippets).forEach(([label, snippetContent]) => {
    const id = `snippets:${formatLabel(label)}:${Date.now()}`;

    if (!commands.hasCommand(id)) {
      registered.push(
        commands.addCommand(id, {
          label,
          execute: async () => {
            await insertSnippetToCell(panel, snippetContent);
          }
        })
      );
    }

    menu.addItem({ command: id });
  });

  return () => registered.forEach(command => command.dispose());
};

export const createSnippetsButton = (
  app: JupyterFrontEnd,
  tracker: INotebookTracker,
  settings: ISettingRegistry.ISettings
): ToolbarButton => {
  const { commands, serviceManager } = app;
  const contents = serviceManager.contents;

  // The most recently opened menu. Disposing it on the next open releases
  // the commands registered for its items, so the global command registry
  // does not grow with every click.
  let activeMenu: Menu | null = null;

  const button = new ToolbarButton({
    label: 'Snippets',
    tooltip: 'Open snippet menu',
    onClick: async () => {
      activeMenu?.dispose();
      activeMenu = null;

      const panel = tracker.currentWidget;

      if (!panel) {
        showErrorMessage('Error', 'No active notebook found');
        return;
      }

      let hasSnippets = false;

      const menu = new Menu({ commands });

      const snippetsPath = settings.get('custom_snippets_path')
        .composite as string;

      if (snippetsPath) {
        const { snippets, error } = await loadSnippetsFromClientFile(
          contents,
          snippetsPath
        );
        if (error) {
          showErrorMessage(error.title, error.message);
        }
        if (snippets) {
          const disposeCommands = addSnippetsToMenu(
            commands,
            menu,
            snippets,
            panel
          );
          menu.disposed.connect(disposeCommands);
          hasSnippets = true;
        }
      } else {
        showErrorMessage(
          'Snippets Error',
          'Unable to find custom snippets file path, did you forget to define one in the settings?'
        );
      }

      if (hasSnippets) {
        activeMenu = menu;
        const rect = button.node.getBoundingClientRect();
        menu.open(rect.left, rect.bottom);
      } else {
        menu.dispose();
        showErrorMessage('Snippets', 'No snippets were found');
      }
    }
  });

  return button;
};
