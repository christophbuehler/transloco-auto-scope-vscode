import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { basename, dirname, extname, join } from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('transloco-auto-scope', () => {
		insertAutoScope();
	});

	context.subscriptions.push(disposable);
}

function insertAutoScope() {
	const editor = vscode.window.activeTextEditor;

	if (!editor) {
		vscode.window.showInformationMessage('Open an editor to insert transloco scope.');
		return;
	}

	const doc = vscode.window.activeTextEditor?.document;

	const startPosition = new vscode.Position(0, 0);
	const endPosition = new vscode.Position(doc?.lineCount!, 0);
	const path = doc!.fileName;

	if (extname(path) !== 'html') {
		vscode.window.showInformationMessage('Open an html file to insert transloco scope.');
		return;
	}

	getTranslocoScope(path).then(scope => {
		const containerOpen = `<ng-container *transloco="let t; read: '${scope}'">\n`;
		const containerClose = '\n</ng-container>'
		editor.edit(editBuilder => {
			editBuilder.insert(endPosition, containerClose);
			editBuilder.insert(startPosition, containerOpen);
			vscode.window.showInformationMessage('Inserted transloco scope.');
		});
	});
}

async function getTranslocoScope(path: string): Promise<string> {
	const parts = [basename(path, '.html')];
	const partsAsScope = () => join(...parts).replace(/(\/|-)/g, '.');
	let dir = dirname(path);
	let projectJsonPath: string;

	do {
		projectJsonPath = join(dir, 'project.json');
		if (existsSync(projectJsonPath)) break;
		if (existsSync(join(dir, 'workspace.json')) || dir === '/') return partsAsScope();
		dir = dirname(dir);
	} while (true);

	const projectJsonRaw = await readFile(projectJsonPath);
	const projectJson = JSON.parse(projectJsonRaw.toString());
	const root = projectJson.root;

	if (root) {
		parts.unshift(root);
	}

	return partsAsScope();
}

export function deactivate() { }
