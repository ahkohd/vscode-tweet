// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as Twitter from 'twitter';
import { TimeLine } from './timelineProvider';
import { PostTweetProvider} from './postTweetProvider';
import TimelineCommands from './timelineCommands';

import { UserWall } from './userWallProvider';
import UserWallCommands from './userWallCommands';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {



	// Register command to show notifications or vscode tweets
	let disposable = vscode.commands.registerCommand('vscode-tweet.showMsg', (type, msg)  => {
		if (type === 'err') {
			vscode.window.showErrorMessage('VSCODE TWEET / '+msg);
		} else if (type === 'info')
		{
			vscode.window.showInformationMessage('VSCODE TWEET / '+msg);
		}
	});




	

	context.subscriptions.push(disposable);

	// Create an Instance of the Twitter CLient 
	let client = new Twitter({
		consumer_key: 'VEkChSwsTXrFf5NR2JsQdsxUL',
		consumer_secret: 'dvYl6ajFJx5VI77pkUBIROzlxKDrdRifacFEtFVmLewgCTauwD',
		access_token_key: '2212463825-4YLj68HAVOk0zXDkYEVsZus04wt5yYuj5D0qMgz',
		access_token_secret: '6GnTRFBjKt2IdLV0a4Lqv7wzHOxSfcTdVMMgJFT3dfxOX'
	  });

	  // Register providers
	vscode.window.registerTreeDataProvider('postTweets', new PostTweetProvider(client));
	new TimeLine(context, client);
	new TimelineCommands(client);
	
	new UserWall(context, client);
	new UserWallCommands(client);
}

// this method is called when your extension is deactivated
export function deactivate() {}
