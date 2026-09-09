import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { ToolbarButton } from '@jupyterlab/apputils';
import { Contents } from '@jupyterlab/services';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { CommandRegistry } from '@lumino/commands';
import { Menu } from '@lumino/widgets';

import { SnippetMap } from './types';
import { readSnippetsPath } from './settings';
import { loadSnippets } from './snippets-loader';
import { insertSnippetBelowActiveCell } from './notebook-actions';
import { notifySnippetError } from './notifications';

/** Turn a snippet label into a slug suitable for a command id. */
const formatLabel = (label: string): string =>
  label.toLowerCase().replace(/\s+/g, '-');

/** Populate `menu` with one item per snippet, backed by a command each. */
const addSnippetsToMenu = (
  menu: Menu,
  snippets: SnippetMap,
  panel: NotebookPanel
): void => {
  const { commands } = menu;

  for (const [label, source] of Object.entries(snippets)) {
    // Salt each id with a timestamp so a rebuild never reuses an existing
    // command: edits to a snippet's body (not just its name) are then
    // always reflected the next time the menu is opened.
    const command = `snippets:${formatLabel(label)}:${Date.now()}`;

    if (!commands.hasCommand(command)) {
      commands.addCommand(command, {
        label,
        execute: async () => {
          const inserted = await insertSnippetBelowActiveCell(panel, source);
          if (!inserted) {
            notifySnippetError(
              'no notebook model',
              'No notebook model available'
            );
          }
        }
      });
    }

    menu.addItem({ command });
  }
};

/**
 * Read the configured snippets file and build a menu of its entries.
 *
 * Each menu owns a private {@link CommandRegistry}, so its commands never
 * touch the application registry and are collected with the menu itself.
 *
 * @returns the menu, or `null` if no menu could be built (a dialog
 * explaining why has already been shown).
 */
const buildSnippetMenu = async (
  contents: Contents.IManager,
  settings: ISettingRegistry.ISettings,
  panel: NotebookPanel
): Promise<Menu | null> => {
  const snippetsPath = readSnippetsPath(settings);
  if (!snippetsPath) {
    notifySnippetError(
      'no file configured',
      'Unable to find custom snippets file path, did you forget to define one in the settings?'
    );
    return null;
  }

  const { snippets, error } = await loadSnippets(contents, snippetsPath);
  if (error) {
    notifySnippetError(error.summary, error.detail);
  }
  if (!snippets) {
    return null;
  }

  const menu = new Menu({ commands: new CommandRegistry() });
  addSnippetsToMenu(menu, snippets, panel);
  return menu;
};

/**
 * Create the notebook toolbar button that opens the snippets menu, anchored
 * beneath the button, for the notebook that is currently active.
 */
export const createSnippetsButton = (
  contents: Contents.IManager,
  tracker: INotebookTracker,
  settings: ISettingRegistry.ISettings
): ToolbarButton => {
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
