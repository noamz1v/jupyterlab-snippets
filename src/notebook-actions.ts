import { NotebookPanel } from '@jupyterlab/notebook';

/**
 * Insert `source` as a new code cell directly below the active cell of
 * `panel`, then make it the active, sole-selected cell.
 *
 * @returns `true` on success, or `false` if the notebook has no model
 * and nothing could be inserted.
 */
export const insertSnippetBelowActiveCell = async (
  panel: NotebookPanel,
  source: string
): Promise<boolean> => {
  await panel.context.ready;

  const notebook = panel.content;
  const model = notebook.model;
  if (!model) {
    return false;
  }

  const insertionIndex = notebook.activeCellIndex + 1;
  model.sharedModel.insertCell(insertionIndex, { cell_type: 'code', source });

  notebook.activeCellIndex = insertionIndex;
  notebook.deselectAll();
  notebook.select(notebook.widgets[insertionIndex]);

  return true;
};
