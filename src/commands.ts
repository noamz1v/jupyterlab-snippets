import { NotebookPanel } from '@jupyterlab/notebook';
import { showErrorMessage } from '@jupyterlab/apputils';

export const insertSnippetToCell = async (
  panel: NotebookPanel,
  snippetContent: string
): Promise<void> => {
  await panel.context.ready;
  const notebook = panel.content;
  const activeIndex = notebook.activeCellIndex;
  const model = notebook.model;

  if (!model) {
    showErrorMessage('Error', 'No notebook model available');
    return;
  }

  model.sharedModel.insertCell(activeIndex + 1, {
    cell_type: 'code',
    source: snippetContent
  });

  notebook.activeCellIndex = activeIndex + 1;
  notebook.deselectAll();
  notebook.select(notebook.activeCell!);
};

export const formatLabel = (label: string): string => {
  return label.toLowerCase().replace(/\s+/g, '-');
};
