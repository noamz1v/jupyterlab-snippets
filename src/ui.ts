import { JupyterFrontEnd } from '@jupyterlab/application';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { ToolbarButton, showErrorMessage } from '@jupyterlab/apputils';
import { Menu } from '@lumino/widgets';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { Snippets } from './types';
import { loadSnippetsFromClientFile } from './snippets-loader';
import { insertSnippetToCell, formatLabel } from './commands';
import { CommandRegistry } from '@lumino/commands';

export const addSnippetsToMenu = (
    commands: CommandRegistry,
    menu: Menu,
    snippets: Snippets,
    panel: NotebookPanel
): void => {
    Object.entries(snippets).forEach(([label, snippetContent]) => {
        const id = `snippets:${formatLabel(label)}:${Date.now()}`;

        if (!commands.hasCommand(id)) {
            commands.addCommand(id, {
                label,
                execute: async () => {
                    await insertSnippetToCell(panel, snippetContent);
                }
            });
        }

        menu.addItem({ command: id });
    });
};

export const createSnippetsButton = (
    app: JupyterFrontEnd,
    tracker: INotebookTracker,
    settings: ISettingRegistry.ISettings
): ToolbarButton => {
    const { commands, serviceManager } = app;
    const contents = serviceManager.contents;

    const button = new ToolbarButton({
        label: 'Snippets',
        tooltip: 'Open snippet menu',
        onClick: async () => {
            const panel = tracker.currentWidget;

            if (!panel) {
                showErrorMessage('Error', 'No active notebook found');
                return;
            }

            let hasSnippets = false;

            const menu = new Menu({ commands });

            let snippetsPath: string;
            snippetsPath = settings.get('custom_snippets_path').composite as string;

            if (snippetsPath) {
                const clientSnippets = await loadSnippetsFromClientFile(contents, snippetsPath);
                if (clientSnippets) {
                    addSnippetsToMenu(commands, menu, clientSnippets, panel);
                    hasSnippets = true;
                }
            } else {
                showErrorMessage('Snippets Error', 'Unable to find custom snippets file path, did you forget to define one in the settings?');
            }

            if (hasSnippets) {
                const rect = button.node.getBoundingClientRect();
                menu.open(rect.left, rect.bottom);
            } else {
                showErrorMessage('Snippets', 'No snippets were found');
            }
        }
    });

    return button;
};