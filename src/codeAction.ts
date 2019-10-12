import * as vscode from 'vscode';

export class Provider implements vscode.CodeActionProvider {
    provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
        // throw new Error("Method not implemented.");
        let actions: vscode.CodeAction[] = [];

        let action = new vscode.CodeAction(`Get Set Generator`, vscode.CodeActionKind.Source);
     
        action.command = {
            title: "Get Set Generator",
            command: "Go-Quickly-Generator.Go-Gen-GetSet"
        } as vscode.Command;
        actions.push(action);
        action.isPreferred =  true;
        
        return actions;       
    } 
}