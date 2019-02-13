// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as Twitter from 'twitter';
import { TimeLine } from './timelineProvider';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	// let disposable = vscode.commands.registerCommand('extension.vscodeTweet', () => {
	// 	// The code you place here will be executed every time your command is executed

	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World!');



	// });

	// context.subscriptions.push(disposable);

	// Create an Instance of the Twitter CLient 
	let client = new Twitter({
		consumer_key: 'ck',
		consumer_secret: 'cs',
		access_token_key: 'atk',
		access_token_secret: 'ats'
	  });
	  
	new TimeLine(context, client);

}

// this method is called when your extension is deactivated
export function deactivate() {}
