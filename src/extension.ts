"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from 'vscode';

class StructInfo {
    ShorthandName: string;
    Name: string;
    Range: number[];
    Fields: Map<string, Field>;

    constructor(name: string, fields: Field[], range: number[]) {
        this.Name = name;

        var sname: string = "";
        sname += this.Name[0].toLowerCase();
        for (let i = 1; i < this.Name.length; i++) {
            let c = this.Name.charCodeAt(i);
            if (c <= 90 && c >= 65) {
                sname += this.Name[i].toLowerCase();
            }
        }

        this.ShorthandName = this.Name;
        this.Range = range;

        this.Fields = new Map<string, Field>();
        fields.forEach((value) => {
            this.Fields.set(value.Key, value);
        });
    }

    getFieldsString(): string[] {
        var result: string[] = [];

        this.Fields.forEach((field, index) => {
            result.push(this.Name + field.toString());
        });

        return result;
    }
}

class Field {
    Parent: string;
    Type: string;
    Name: string;
    Range: number[];
    Key: string;

    constructor(parent: string, type: string, name: string, range: number[]) {
        this.Parent = parent;
        this.Type = type;
        this.Name = name;
        this.Range = range;
        
        this.Key = (this.Parent.substr(1) + this.Name[0].toUpperCase() + this.Name.substr(1)).replace(new RegExp("\\.", "g"), "");
        // TODO: 大小写Map的问题
    }

    toString(): string {
        return this.Parent.substr(1) + this.Name + " " + this.Type;
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "go-quickly-generator" is now active!');
 
    context.subscriptions.push(vscode.commands.registerCommand('Go-Quickly-Generator.Go-Gen-GetSet', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        let sinfo = GetStruct();
        if(sinfo) {
            GeneratorSetGet(sinfo);
        } else {
            vscode.window.showErrorMessage("there is no struct(go) to focus. you can move point to struct(go)");
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

function getAbbreviation(name: string): string | undefined {
    if (name.length) {
        let shortName = name[0].toLowerCase();
        let m = name.substr(1).match("[A-Z]");
        if (m) {
            m.forEach((v) => {
                shortName += v.toLowerCase();
            });
            return shortName;
        }
    }
    return undefined;
}

function GeneratorSetGet(sinfo: StructInfo) {

        console.log(sinfo);

        let editor = vscode.window.activeTextEditor;
        if (editor !== undefined) {

            let regexFunction = `func {0,}\\(.+${sinfo.Name} {0,}\\) {0,}[GS]et([a-zA-Z_]+) {0,}\\(`;
            // console.log(regexFunction);
            let existsStructFunctions: Set<string> = new Set<string>();
            for (let n = 0; n < editor.document.lineCount; n++) {
                let line = editor.document.lineAt(n);
                let matches = line.text.match(regexFunction);
                if (matches !== null) {
                    // console.log(matches[0], matches[1]);
                    existsStructFunctions.add(matches[1]);
                }
            }

            const options = <vscode.QuickPickOptions>{ canPickMany: true, placeHolder: "select the fields that would be generator get set" };
            var items: vscode.QuickPickItem[] = [];
            var obj = {
                info: sinfo,
                exists: existsStructFunctions,
                items: function () {
                    this.info.Fields.forEach((value, key) => {
                        if (this.exists.has(key)) {
                            vscode.window.showInformationMessage("Get" + key + " or Set" + key + " is Exists");
                        } else {
                            items.push(<vscode.QuickPickItem>{
                                label: value.toString(),
                                detail: this.info.Name,
                                description: key,
                            });
                        }
                    });
                },

                pick: function () {
                    this.items();
                    vscode.window.showQuickPick(items, options).then((item) => {
                        if (item) {
                            let fields = item as any as vscode.QuickPickItem[];
                            let sname = getAbbreviation(this.info.Name) as string;
                            let structString = `func (${sname} *${this.info.Name})`;

                            fields.forEach((qitem) => {
                                let field = this.info.Fields.get(qitem.description as string);
                                if (field) {
  
                                    let editor = vscode.window.activeTextEditor;
                                    if (editor) {

                                        let keyName = field.Name[0].toUpperCase() + field.Name.substr(1);
                                        let funcitonName = field.Parent.replace( new RegExp("\\.", "g"), "") + keyName ;

                                        // Set
                                        let prefix = "Set";
                                        let setFunction = prefix + funcitonName ;
                                        let params = `(${field.Name} ${field.Type})`;
                                        let comment = `// ${setFunction} ${prefix} ${field.Name} ${field.Type}\n`;
                                        let ss = new vscode.SnippetString(`\n${comment}${structString} ${setFunction}${params} {\n\t${sname}${field.Parent}${field.Name} = ${field.Name}\n}\n`);
                                        editor.insertSnippet(ss, new vscode.Position(this.info.Range[1] + 1, 0));

                                        prefix = "Get";
                                        let getFunction = prefix + funcitonName ;
                                        comment = `// ${getFunction} ${prefix} return ${field.Name} ${field.Type}\n`;
                                        ss = new vscode.SnippetString(`\n${comment}${structString} ${getFunction}() ${field.Type} {\n\treturn ${sname}${field.Parent}${field.Name}\n}\n`);
                                        editor.insertSnippet(ss, new vscode.Position(this.info.Range[1] + 1, 0)); 
            
                                    }
                                }
                            });
                        }
                    });
                }
            };

            obj.pick();
        }
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
                    if (i === end) {
                        // let matches = textline.text.match("struct {0,}\\{[^ \t]+\\}");
                        function getSingleStructRelationship(source: string, parent: string): Field | undefined {
                            let smatch = source.match("([^ \t]+)[^s]+struct {0,}\\{(.+)\\}");
                            if (smatch !== null) {
                                // console.log(smatch[0], smatch[1], smatch[2]);
                                return getSingleStructRelationship(smatch[2], parent + "." + smatch[1]);
                            } else {
                                smatch = source.match("([^ \t]+)[ \t]+(.+)");
                                if (smatch !== null) {
                                    return new Field(parent + ".", smatch[2].trim(), smatch[1], [i, end]);
                                }
                            }
                        }

                        let v = getSingleStructRelationship(textline.text, "");
                        if (v !== undefined) {
                            result.push(v);
                        }
                    } else {
                        result = result.concat(getStructField(editor, parent + fieldName, i, end));
                        i = end;
                    }
                    break;
                case 'interface':
                    result.push(new Field(parent, fieldType + "{}", fieldName, [i, i]));
                    break;
                case 'func':
                    end = getFieldRange(editor, ['(', ')'], i, endline);
                    if (i === end) {
                        let matches = textline.text.match("func\\(.+");
                        if (matches !== null) {
                            result.push(new Field(parent, matches[0].trim(), fieldName, [i, end]));
                        }
                    } else {
                        i = end;
                    }
                    break;
                default:
                    result.push(new Field(parent, fieldType, fieldName, [i, i]));
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
