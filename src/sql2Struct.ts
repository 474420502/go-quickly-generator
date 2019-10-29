import * as vscode from 'vscode';
import { SelectedDecorationType } from './base';
import { GetPatternRange } from './utils';

const typeMap = new Map<string, string[]>();

typeMap.set("tinyint", ["NullInt32", "int8", "uint8"]);
typeMap.set("smallint", ["NullInt32", "int16", "uint16"]);
typeMap.set("mediumint", ["NullInt32", "int32", "uint32"]);
typeMap.set("int", ["NullInt32", "int32", "uint32"]);
typeMap.set("integer", ["NullInt32", "int32", "uint32"]);
typeMap.set("bigint", ["NullInt64", "int64", "uint64"]);

typeMap.set("bit", ["NullInt32", "int32", "uint32"]);
typeMap.set("bool", ["NullBool", "bool", "bool"]);
typeMap.set("boolean", ["NullBool", "bool", "bool"]);


typeMap.set("float", ["NullFloat64", "float64", "float64"]);
typeMap.set("double", ["NullFloat64", "float64", "float64"]);
typeMap.set("real", ["NullFloat64", "float64", "float64"]);
typeMap.set("decimal", ["NullFloat64", "float64", "float64"]);
typeMap.set("numeric", ["NullFloat64", "float64", "float64"]);


typeMap.set("char", ["NullString", "string", "string"]);
typeMap.set("character", ["NullString", "string", "string"]);
typeMap.set("varchar", ["NullString", "string", "string"]);
typeMap.set("tinytext", ["NullString", "string", "string"]);
typeMap.set("text", ["NullString", "string", "string"]);
typeMap.set("mediumtext", ["NullString", "string", "string"]);
typeMap.set("longtext", ["NullString", "string", "string"]);

typeMap.set("binary", ["RawBytes", "[]byte", "[]byte"]);
typeMap.set("varbinary", ["RawBytes", "[]byte", "[]byte"]);
typeMap.set("tinyblob", ["RawBytes", "[]byte", "[]byte"]);
typeMap.set("blob", ["RawBytes", "[]byte", "[]byte"]);
typeMap.set("mediumblob", ["RawBytes", "[]byte", "[]byte"]);
typeMap.set("longblob", ["RawBytes", "[]byt", "[]byt"]);


typeMap.set("date", ["NullTime", "time.Time", "time.Time"]);
typeMap.set("time", ["NullTime", "time.Time", "time.Time"]);
typeMap.set("datetime", ["NullTime", "time.Time", "time.Time"]);
typeMap.set("timestamp", ["NullTime", "time.Time", "time.Time"]);

function commandSQL2Struct() {
    GetTableStruct();
}

function sqlName2goName(name: string): string | undefined { 
    let ss = name.split(new RegExp("[^a-zA-Z `]+"));
    if(ss.length) {

        let gName = "";
        ss.forEach( (v) => {
            if(v.length) {
                gName += v[0].toLocaleUpperCase() + v.substr(1);
            }
        } );
        return gName;
    }
}

class SQLField {
    Name: string;
    TypeName: string;
    Comment: string;
    IsNotNull: boolean;
    IsUnsigned: boolean;

    constructor(Name: string, TypeName:string, Comment: string, IsNotNull: boolean, IsUnsigned: boolean) {
        this.Name = Name;
        this.TypeName = TypeName;
        this.Comment = Comment;
        this.IsNotNull = IsNotNull;
        this.IsUnsigned = IsUnsigned;
    }
}

function GetTableStruct() {
    let result = GetPatternRange(new RegExp("CREATE +TABLE +`{0,1}([^`]+)`{0,1}", "i"), "()");
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
                    let linematches = line.text.match(new RegExp("`{0,1}([^ `]+)`{0,1} +([^ \\(]+)(.+)", "i"));
                    if(linematches) {
                        let gFieldName = sqlName2goName(linematches[1]);
                        if(gFieldName) {
                            let typename = linematches[2];
                            let remainstr = linematches[3];

                            if(gFieldName === "KEY" || typename === "KEY") {
                                break;
                            }

                            // let comment = linematches[linematches.length - 1];
                            var comment: string = "";
                            let cm = remainstr.match("(.+) COMMENT +(\\S+),{0,1}$");
                            if(cm) {
                                comment = cm[2];
                
                                if(comment[comment.length - 1] === ',') {
                                    comment = comment.substring(0, comment.length - 1);
                                }

                                remainstr = cm[1];
                            }

                            var IsNotNull:boolean = false;
                            var IsUnsigned: boolean = false;

                            let flagstr = remainstr.toLowerCase();
                            let fmatch = flagstr.match("not +null");
                            if(fmatch) {
                                IsNotNull = true;
                            }

                            IsUnsigned =  flagstr.includes("unsigned");
                            let field = new SQLField(gFieldName, typename,comment, IsNotNull, IsUnsigned);
                            sqlfields.push(field);
                        }

                    }
                }

                // 创建结构体
                let structstring = "";
                let fieldsstring = ""; 
 
                sqlfields.forEach((sqlf) => {
                    let tValue = typeMap.get(sqlf.TypeName);
                    let typeName = sqlf.TypeName;

                    if (tValue) {
                        if(sqlf.IsNotNull) {
                            if(sqlf.IsUnsigned) {
                                typeName = tValue[2];
                            } else {
                                typeName = tValue[1];
                            }
                        } else {
                            typeName = "sql." + tValue[0];
                        }
                    }
                    fieldsstring += `\t${sqlf.Name}\t${typeName}\t// ${sqlf.Comment}\n`;
                });

                if(fieldsstring[fieldsstring.length - 1] === '\n') {
                    fieldsstring = fieldsstring.substring(0, fieldsstring.length - 1);
                }

                structstring = `\ntype ${gname} struct {\n${fieldsstring}\n}\n`;
                // console.log(sqlfields);
                // console.log(structstring);
                let ss = new vscode.SnippetString(structstring);
                for(let n = endline;n < editor.document.lineCount; n++) {
                    if(editor.document.lineAt(n).text === "") {
                        endline = n;
                        editor.insertSnippet(ss, new vscode.Position(endline, 0));
                        break;
                    }
                }  

                editor.selection = new vscode.Selection(startline, 0, endline, 0);
            }
        }
    }
}

export { commandSQL2Struct };