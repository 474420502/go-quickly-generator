"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from 'vscode';
import { Provider } from './codeAction';
import { StructInfo, Field } from './base';
import { commandSetterGetter } from './structSetterGetter';
import { commandSQL2Struct } from './sql2Struct';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "go-quickly-generator" is now active!');
    context.subscriptions.push(vscode.commands.registerCommand('Go-Quickly-Generator.Go-Gen-GetSet', commandSetterGetter));
    context.subscriptions.push(vscode.commands.registerCommand('Go-Quickly-Generator.Go-Gen-SQL2Struct', commandSQL2Struct));
    
    // context.subscriptions.push(vscode.languages.registerCodeActionsProvider(
    //     "go", new Provider(), { providedCodeActionKinds: [vscode.CodeActionKind.Source] }
    // ));
}

exports.activate = activate;
// export function getStruct(editor: vscode.TextEditor) {
// }
// this method is called when your extension is deactivated
function deactivate() { 

}
exports.deactivate = deactivate;
