import { NotebookPanel } from '@jupyterlab/notebook';
import { CommandRegistry } from '@lumino/commands';

import { insertSnippetBelowActiveCell } from './notebook-actions';
import { notifySnippetError } from './notifications';

/** Turn a snippet label into a slug suitable for a command id. */
const formatLabel = (label: string): string =>
  label.toLowerCase().replace(/\s+/g, '-');

/** Insert a snippet into `panel`, reporting to the user if it could not be. */
const runSnippet = async (
  panel: NotebookPanel,
  source: string
): Promise<void> => {
  const inserted = await insertSnippetBelowActiveCell(panel, source);
  if (!inserted) {
    notifySnippetError('no notebook model', 'No notebook model available');
  }
};

/**
 * Register a command on `commands` that inserts `source` into `panel`,
 * and return its id.
 *
 * The id is salted with a timestamp so a rebuild never reuses an existing
 * command: an edit to a snippet's body (not just its name) is then always
 * reflected the next time the menu is opened.
 */
export const registerSnippetCommand = (
  commands: CommandRegistry,
  label: string,
  source: string,
  panel: NotebookPanel
): string => {
  const id = `snippets:${formatLabel(label)}:${Date.now()}`;

  if (!commands.hasCommand(id)) {
    commands.addCommand(id, {
      label,
      execute: () => runSnippet(panel, source)
    });
  }

  return id;
};
