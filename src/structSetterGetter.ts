

import * as vscode from 'vscode';
import { Provider } from './codeAction';
import { StructInfo, Field, GeneratorType } from './base';
import { GetPatternRange } from './utils';

let typeMap = new Map<string, GeneratorType>();
let typeCharMap = new Map<GeneratorType, string>();

const dtype = vscode.window.createTextEditorDecorationType({
    cursor: 'crosshair',
    backgroundColor: { id: 'QuicklyGenerator.StructSelected' }
});

typeMap.set("Getter", GeneratorType.Getter);
typeMap.set("Setter", GeneratorType.Setter);
typeCharMap.set(GeneratorType.Getter, "G");
typeCharMap.set(GeneratorType.Setter, "S");
typeCharMap.set(GeneratorType.Getter | GeneratorType.Setter, "GS");


function commandSetterGetter() {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    let sinfo = GetStruct();
    let editor = vscode.window.activeTextEditor;
    if (sinfo && editor) {

        let decoration = <vscode.DecorationOptions>{ range: new vscode.Range(sinfo.Range[0], 0, sinfo.Range[1] + 1, 0) };
        editor.setDecorations(dtype, [decoration]);

        vscode.window.showQuickPick(["Getter", "Setter"], <vscode.QuickPickOptions>{ canPickMany: true, placeHolder: "select generator type getter or setter" }).then(items => {
            console.log(items);

            if (items) {
                let myitems = items as any as string[];
                let gtype = GeneratorType.Unknown;
                myitems.forEach((value) => {
                    let sel = typeMap.get(value);
                    if (sel) {
                        gtype = gtype | sel;
                    }
                });
                if (sinfo) {
                    GeneratorSetGet(sinfo, gtype);
                }
            }

            let editor = vscode.window.activeTextEditor;
            if (editor) {
                editor.setDecorations(dtype, []);
            }
        });
    } else {
        vscode.window.showErrorMessage("there is no struct(go) to focus. please move cursor in the code of struct.");
    }
}


function GeneratorSetGet(sinfo: StructInfo, stype: GeneratorType) {

    console.log(sinfo);

    let editor = vscode.window.activeTextEditor;
    if (editor !== undefined) {

        let gtypechar = typeCharMap.get(stype) as string;
        let regexFunction = `^func {0,}\\(.+${sinfo.Name} {0,}\\) {0,}[${gtypechar}]et([a-zA-Z_]+) {0,}\\(`;
        // console.log(regexFunction);
        let existsStructFunctions: Set<string> = new Set<string>();
        for (let n = 0; n < editor.document.lineCount; n++) {
            let line = editor.document.lineAt(n);
            let matches = line.text.match(regexFunction);
            if (matches !== null) {
                existsStructFunctions.add(matches[1]);
            }
        }

        const options = <vscode.QuickPickOptions>{ canPickMany: true, placeHolder: "select the fields that would be generator get set" };
        var items: vscode.QuickPickItem[] = [];

        var obj = {
            info: sinfo,
            exists: existsStructFunctions,

            fields2items: function () {
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
                this.fields2items();
                if (items.length) {
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
                                        let funcitonName = field.Parent.replace(new RegExp("\\.", "g"), "") + keyName;

                                        // Set
                                        if (stype & GeneratorType.Setter) {
                                            let prefix = "Set";
                                            let setFunction = prefix + funcitonName;
                                            let params = `(${field.Name} ${field.Type})`;
                                            let comment = `// ${setFunction} ${prefix} ${field.Name} ${field.Type}\n`;
                                            let ss = new vscode.SnippetString(`\n${comment}${structString} ${setFunction}${params} {\n\t${sname}${field.Parent}${field.Name} = ${field.Name}\n}\n`);
                                            editor.insertSnippet(ss, new vscode.Position(this.info.Range[1] + 1, 0));
                                        }

                                        if (stype & GeneratorType.Getter) {
                                            let prefix = "Get";
                                            let getFunction = prefix + funcitonName;
                                            let comment = `// ${getFunction} ${prefix} return ${field.Name} ${field.Type}\n`;
                                            let ss = new vscode.SnippetString(`\n${comment}${structString} ${getFunction}() ${field.Type} {\n\treturn ${sname}${field.Parent}${field.Name}\n}\n`);
                                            editor.insertSnippet(ss, new vscode.Position(this.info.Range[1] + 1, 0));
                                        }
                                    }
                                }
                            });
                        }
                    });
                }
            }
        };

        obj.pick();
    }
}

function GetStruct(): StructInfo | undefined {
    let result = GetPatternRange("type +([^ ]+) +struct", "{}");
    if (result) {
        let editor = vscode.window.activeTextEditor as any;
        let matches: RegExpMatchArray = result[0] as RegExpMatchArray;
        let startline = result[1] as number;
        let endline = result[2] as number;
        return new StructInfo(matches[1], getStructField(editor, "", startline, endline), [startline, endline]);
    }
}

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

// getAbbreviation 获取结构的简称
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


export { commandSetterGetter };