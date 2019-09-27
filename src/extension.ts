// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "go-quickly-generator" is now active!');

	context.subscriptions.push( vscode.commands.registerCommand('go-quickly-generator.go-gen-set', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		let editor = vscode.window.activeTextEditor;

		if (editor !== undefined) {
			if (editor.document.languageId !== 'go') {
				vscode.window.showInformationMessage('file in the active editor is not a go file(*.go)');
				return;
			}			

			let selection = editor.selection;
	
			// vscode.window.showInformationMessage( editor.document.version.toString() );
			// vscode.window.showInformationMessage( text );

			let selectline  = selection.active.line;
			let regex = "type +([^ ]+) +struct";
			// lineText.text.match()

			for(let i = selectline; i >= 0; i--) {

				let lineText = editor.document.lineAt(i);
				let matchs = lineText.text.match(regex);
				if(matchs) {
					console.log(matchs[0], matchs[1]);

					vscode.window.showInformationMessage( lineText.text + "," + i.toString() );
					let open = 0;
					BREAK_OPEN:
					for(let n = i ; n < editor.document.lineCount ; n++){
						
						let lineText = editor.document.lineAt(n);
						for(let c = 0; c < lineText.text.length ; c ++) {
							switch(lineText.text[c]) {
							case '{':
								open ++;
								break;
							case '}':
								open --;
								if(open === 0) {
									if(n >= selectline) {
										let structName = matchs[1];
										// i(start) n(end)
										
										getStructInfo(editor, structName, i, n);
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



function getStructInfo(editor: vscode.TextEditor, name: string, startline: number, endline: number) {
	let regex = "([^ ]+) +([^ \\(\\{]+)";

	for(let i = startline; i <= endline; i ++) {
		let textline = editor.document.lineAt(i);
		switch(textline.text[-1]) {
			case '{':
				break;
			case '}':
				break;
			case '(':
				break;
			case '}':
				break;
		}
	}
}

// type A struct {
//    do int	
// }
//  
// export function getStruct(editor: vscode.TextEditor) {

// }

// this method is called when your extension is deactivated
export function deactivate() {}
