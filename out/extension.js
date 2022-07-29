"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const vscode = require("vscode");
function activate(context) {
    let disposable = vscode.commands.registerCommand('transloco-auto-scope', () => {
        insertAutoScope();
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function insertAutoScope() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('Open an editor to insert transloco scope.');
        return;
    }
    const doc = vscode.window.activeTextEditor?.document;
    const startPosition = new vscode.Position(0, 0);
    const endPosition = new vscode.Position(doc?.lineCount, 0);
    const path = doc.fileName;
    if ((0, path_1.extname)(path) !== '.html') {
        vscode.window.showInformationMessage('Open an html file to insert transloco scope.');
        return;
    }
    getTranslocoScope(path).then(scope => {
        const containerOpen = `<ng-container *transloco="let t; read: '${scope}'">\n`;
        const containerClose = '\n</ng-container>';
        editor.edit(editBuilder => {
            editBuilder.insert(endPosition, containerClose);
            editBuilder.insert(startPosition, containerOpen);
            vscode.window.showInformationMessage('Inserted transloco scope.');
        });
    });
}
async function getTranslocoScope(path) {
    const parts = [(0, path_1.basename)(path, '.html')];
    const partsAsScope = () => (0, path_1.join)(...parts).replace(/(\/|-)/g, '.');
    let dir = (0, path_1.dirname)(path);
    let projectJsonPath;
    do {
        projectJsonPath = (0, path_1.join)(dir, 'project.json');
        if ((0, fs_1.existsSync)(projectJsonPath))
            break;
        if ((0, fs_1.existsSync)((0, path_1.join)(dir, 'workspace.json')) || dir === '/')
            return partsAsScope();
        dir = (0, path_1.dirname)(dir);
    } while (true);
    const projectJsonRaw = await (0, promises_1.readFile)(projectJsonPath);
    const projectJson = JSON.parse(projectJsonRaw.toString());
    const root = projectJson.root;
    if (root) {
        parts.unshift(root);
    }
    return partsAsScope();
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map