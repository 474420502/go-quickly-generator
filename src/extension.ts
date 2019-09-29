"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from 'vscode';

class StructInfo {
    Name: string;
    Range: number[];
    Fields: Field[];

    constructor(name: string, fields: Field[], range: number[]) {
        this.Name = name;
        this.Range = range;
        this.Fields = fields;
    }

    getFieldsString(): string[] {
        var result: string[] = [];

        this.Fields.forEach( (field, index) => {
            result.push( "("+index+") " + this.Name + field.Parent + field.Name + " " + field.Type);
        });

        return result;
    }
}

class Field {
    Parent: string;
    Type: string;
    Name: string;
    Range: number[];

    constructor(parent: string, type: string, name: string, range: number[]) {
        this.Parent = parent;
        this.Type = type;
        this.Name = name;
        this.Range = range;
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "go-quickly-generator" is now active!');
    context.subscriptions.push(vscode.commands.registerCommand('go-quickly-generator.go-gen-set', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        let sinfo = GetStruct();
        if(sinfo) {
            console.log(sinfo);
            const options = <vscode.QuickPickOptions>{canPickMany: true, placeHolder: "select the fields that would be generator get set"};
            vscode.window.showQuickPick(sinfo.getFieldsString(), options).then( (input)=>{
                if(typeof(input) !== "string") {
                    var  selections: string[] = input as any;
                    console.log(selections); // TODO:
                }
            });
        }
    }));



    context.subscriptions.push(vscode.commands.registerCommand('go-quickly-generator.allGetterAndSetter', function () {
        let editor = vscode.window.activeTextEditor;
        if (editor !== undefined) {
            const currentPos = editor.selection.active;
            const lineCount = editor.document.lineCount;
            // let selection = editor.selection;
            // let lineText = editor.document.lineAt(selection.active);
            // vscode.window.showInformationMessage( lineText.text );
        }
    }));
}


function GetStruct(): StructInfo | undefined {
    let editor = vscode.window.activeTextEditor;
    if (editor !== undefined) {
        if (editor.document.languageId !== 'go') {
            vscode.window.showInformationMessage('file in the active editor is not a go file(*.go)');
            return;
        }
        let selection = editor.selection;
        // vscode.window.showInformationMessage( editor.document.version.toString() );
        // vscode.window.showInformationMessage( text );
        let selectline = selection.active.line;
        let regex = "type +([^ ]+) +struct";
        // lineText.text.match()
        for (let i = selectline; i >= 0; i--) {
            let lineText = editor.document.lineAt(i);
            let matchs = lineText.text.match(regex);
            if (matchs !== null) {
                let open = 0;
                BREAK_OPEN: for (let n = i; n < editor.document.lineCount; n++) {
                    let lineText = editor.document.lineAt(n);
                    for (let c = 0; c < lineText.text.length; c++) {
                        switch (lineText.text[c]) {
                            case '{':
                                open++;
                                break;
                            case '}':
                                open--;
                                if (open === 0) {
                                    if (n >= selectline) {
                                        let structName = matchs[1];  
                                        return new StructInfo(structName, getStructField(editor, "", i, n), [i, n]);
                                    }
                                    break BREAK_OPEN;
                                }
                                break;
                        }
                    }
                }
                break;
            }
        }
    }
}

exports.activate = activate;
function getStructField(editor: vscode.TextEditor, parent: string, startline: number, endline: number): Field[] {

    let result: Field[] = [];

    if (endline - startline <= 1) {
        return result;
    }

    parent += ".";
    
    let regex = "([^ \t]+)[ \t]+([^ \\(\\{\t]+)";
    for (let i = startline + 1; i < endline; i++) {
        let textline = editor.document.lineAt(i);
        let matchArray = textline.text.match(regex);

        if (matchArray !== null) {
            var end: number;
            let fieldName = matchArray[matchArray.length - 2];
            let fieldType = matchArray[matchArray.length - 1].trim();
            
            switch (fieldType) {
                case 'struct':
                    end = getFieldRange(editor, ['{', '}'], i, endline);
                    if(i === end ) {
                        // let matches = textline.text.match("struct {0,}\\{[^ \t]+\\}");
                        function getSingleStructRelationship(source: string, parent: string): Field | undefined {
                            let smatch = source.match("([^ \t]+)[^s]+struct {0,}\\{(.+)\\}");
                            if(smatch !== null) {
                                console.log(smatch[0],smatch[1],smatch[2]);
                                return getSingleStructRelationship(smatch[2], parent + "." + smatch[1]);
                            } else {
                                smatch = source.match("([^ \t]+)[ \t]+(.+)");
                                if(smatch !== null) {
                                    return new Field(parent+".", smatch[2].trim(), smatch[1], [i, end]);
                                }
                            }
                        }

                        let v = getSingleStructRelationship(textline.text, "");
                        if(v !== undefined) {
                            result.push(v);
                        }
                    } else {
                        result = result.concat(getStructField(editor, parent  + fieldName, i, end));
                        i = end;
                    }
                    break;
                case 'interface':
                    result.push(new Field( parent, fieldType + "{}", fieldName, [i,i]));
                    break;
                case 'func':
                    end = getFieldRange(editor, ['(', ')'], i, endline);
                    if(i === end) {
                        let matches = textline.text.match("func\\(.+");
                        if(matches !== null) {
                            result.push(new Field( parent, matches[0].trim(), fieldName, [i, end]));
                        }
                    }  else {
                        i = end;
                    }
                    break;
                default:
                    result.push(new Field( parent, fieldType, fieldName, [i,i]));
                    break;
            }
        }
    }

    return result;
}

function getFieldRange(editor: vscode.TextEditor, pair: string[], startline: number, endline: number): number {

    let open = 0;
    let start = startline;
    let end = startline;

    BREAK_OPEN: for (let n = start; n < endline; n++) {
        let lineText = editor.document.lineAt(n);
        for (let c = 0; c < lineText.text.length; c++) {
            switch (lineText.text[c]) {
                case pair[0]:
                    open++;
                    break;
                case pair[1]:
                    open--;
                    if (open === 0) {
                        end = n;
                        break BREAK_OPEN;
                    }
                    break;
            }
        }
    }

    return end;
}


// export function getStruct(editor: vscode.TextEditor) {
// }
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
