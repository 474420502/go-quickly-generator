import * as vscode from 'vscode';
import { StructInfo, Field, GeneratorType } from './base';
import { GetPatternRange } from './utils';

function commandSQL2Struct() {
    GetTableStruct();
}

function sqlName2goName(name: string): string | undefined { 
    let ss = name.split(new RegExp("[^a-zA-Z]+"));
    if(ss.length) {

        let gName = "";
        ss.forEach( (v) => {
            gName += v[0].toLocaleUpperCase() + v.substr(1);
        } );
        return gName;
    }
}

class SQLField {
    Name: string;
    TypeName: string;
    Comment: string;

    constructor(Name: string, TypeName:string, Comment: string) {
        this.Name = Name;
        this.TypeName = TypeName;
        this.Comment = Comment;
    }
}

function GetTableStruct() {
    let result = GetPatternRange(new RegExp("CREATE +TABLE +`{0,1}([^`]+)`{0,1} +\\(", "i"), "()");
    if(result) {
        let editor = vscode.window.activeTextEditor ;
        if(editor) {
            let matches: RegExpMatchArray = result[0] as RegExpMatchArray;
            let name = matches[1] as string;
            let gname = sqlName2goName(name);

            let startline = result[1] as number;
            let endline = result[2] as number;

            if(gname) {

                let sqlfields: SQLField[] = [];
                for(let i = startline + 1; i < endline ; i ++) {
                    let line = editor.document.lineAt(i);
                    let linematches = line.text.match(new RegExp("`{0,}([^ `]+)`{0,} +([^ \\(]+).+COMMENT +(\\S+),{0,1}$", "i"));
    
                    if(linematches) {
                        let gFieldName = sqlName2goName(linematches[1]);
                        if(gFieldName) {
                            let typename = linematches[2];
                            let comment = linematches[3];

                            if(comment[comment.length - 1] === ',') {
                                comment = comment.substring(0, comment.length - 1);
                            }

                            console.log(name, gname, linematches[1],  gFieldName,  linematches);
                            let field = new SQLField(gFieldName, typename,comment );
                            sqlfields.push(field);
                        }

                    }
                }

                // 创建结构体
                let structstring = "";
                let fieldsstring = ""; 

                sqlfields.forEach((sqlf) => {
                    fieldsstring += `\t${sqlf.Name}\t${sqlf.TypeName}\t// ${sqlf.Comment}\n`;
                });

                if(fieldsstring[fieldsstring.length - 1] === '\n') {
                    fieldsstring = fieldsstring.substring(0, fieldsstring.length - 1);
                }

                structstring = `\ntype ${gname} struct {\n${fieldsstring}\n}\n`;
                console.log(sqlfields);
                console.log(structstring);

                let ss = new vscode.SnippetString(structstring);
                for(let n = endline;n < editor.document.lineCount; n++) {
                    if(editor.document.lineAt(n).text === "") {
                        endline = n;
                        editor.insertSnippet(ss, new vscode.Position(endline, 0));
                        break;
                    }
                }  
            }
        }
    }
}

export { commandSQL2Struct };