import { NotebookPanel } from '@jupyterlab/notebook';

/**
 * Insert `snippetContent` as a new code cell directly below the active
 * cell of `panel`, then make it the active, sole-selected cell.
 *
 * @returns `true` on success, or `false` if the notebook has no model
 * and nothing could be inserted.
 */
export const insertSnippetToCell = async (
  panel: NotebookPanel,
  snippetContent: string
): Promise<boolean> => {
  await panel.context.ready;
  const notebook = panel.content;
  const activeIndex = notebook.activeCellIndex;
  const model = notebook.model;

  if (!model) {
    return false;
  }

  model.sharedModel.insertCell(activeIndex + 1, {
    cell_type: 'code',
    source: snippetContent
  });

  notebook.activeCellIndex = activeIndex + 1;
  notebook.deselectAll();
  notebook.select(notebook.activeCell!);

  return true;
};
