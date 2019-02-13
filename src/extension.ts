// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
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


	// Register providers...
	// const tweetTimeline = new TimeLineNodeProvider({username: 'ahkohd'});
	// vscode.window.registerTreeDataProvider('twitterTimeline', tweetTimeline);
	// vscode.commands.registerCommand('twitterTimeline.refresh', () => tweetTimeline.refresh());
	// vscode.commands.registerCommand('extension.openPackageOnNpm', moduleName => vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://www.npmjs.com/package/${moduleName}`)));

	new TimeLine(context);

}

// this method is called when your extension is deactivated
export function deactivate() {}
