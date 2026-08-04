import { Contents } from '@jupyterlab/services';
import { showErrorMessage } from '@jupyterlab/apputils';
import { Snippets } from './types';


const validateSnippets = (result: any): void => {
    if (
        result === null ||
        typeof result !== 'object' ||
        Array.isArray(result) ||
        !Object.entries(result).every(
            ([key, value]) =>
                typeof key === 'string' &&
                key.trim() !== '' &&
                typeof value === 'string'
        )
    ) {
        throw new Error(
            'Snippets file is invalid. Expected a JSON object where each key is a non-empty string and each value is a string of code.\n\nExample: { "Example Snippet": "print(\\"hello world\\")" }'
        );
    }
};

export const loadSnippetsFromClientFile = async (
    contents: Contents.IManager,
    relativePath: string
): Promise<Snippets | null> => {
    try {
        const file = await contents.get(relativePath, {
            type: 'file',
            format: 'text',
            content: true
        });

        const customSnippetsJson = file.content as string;
        if (!customSnippetsJson){
            return null;
        }

        let result;
        try {
            result = JSON.parse(customSnippetsJson);
        }
        catch (err: any){
            showErrorMessage('Bad file format', `The snippets file's content is not valid JSON format.`);
            return null;
        }

        validateSnippets(result);

        return result as Snippets;
    } catch (err: any) {
        if (err.response?.status === 404) {
            showErrorMessage('Snippets Not Found', `The snippets file was not found at: ${relativePath}`);
        } else {
            showErrorMessage('Snippets Error', `Failed to fetch snippets file due to the following error: ${String(err.message || err)}`);
        }
        return null;
    }
};
