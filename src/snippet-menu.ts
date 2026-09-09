import { NotebookPanel } from '@jupyterlab/notebook';
import { CommandRegistry } from '@lumino/commands';
import { Menu } from '@lumino/widgets';

import { SnippetMap } from './types';
import { registerSnippetCommand } from './snippet-command';

/**
 * Build a menu with one item per snippet. The menu owns a private
 * {@link CommandRegistry}, so its commands never touch the application
 * registry and are collected together with the menu.
 */
export const createSnippetMenu = (
  snippets: SnippetMap,
  panel: NotebookPanel
): Menu => {
  const menu = new Menu({ commands: new CommandRegistry() });

  for (const [label, source] of Object.entries(snippets)) {
    const command = registerSnippetCommand(menu.commands, label, source, panel);
    menu.addItem({ command });
  }

  return menu;
};
