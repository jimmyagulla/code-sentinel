import type * as vscode from 'vscode';

/** Use for `registerHoverProvider`, `registerCodeLensProvider`, etc. */
export const FILE_SCHEME_DOCUMENT_FILTER: vscode.DocumentFilter = { scheme: 'file' };
