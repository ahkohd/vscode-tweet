import * as vscode from 'vscode';
import * as Twitter from 'twitter';
import { TimeLine } from './timelineProvider';
import { PostTweetProvider} from './postTweetProvider';
import TimelineCommands from './timelineCommands';

import { UserWall } from './userWallProvider';
import UserWallCommands from './userWallCommands';

import SettingsProvider from './SettingsProvider';


import { TrendingTweetsProvider, TrendingRefresh } from './TrendingTweetsProvider';

export function activate(context: vscode.ExtensionContext) {
	// Register command to show notifications or vscode tweets
	let disposable = vscode.commands.registerCommand('vscode-tweet.showMsg', (type, msg)  => {
		if(vscode.workspace.getConfiguration().get('vscodeTweet.dontdistrubmode') === true)
		{
			// prvent showing notifications  when in don't distrub mode...
			return;
		}
		if (type === 'err') {
			vscode.window.showErrorMessage('VSCODE TWEET / '+msg);
		} else if (type === 'info')
		{
			vscode.window.showInformationMessage('VSCODE TWEET / '+msg);
		}
	});
	context.subscriptions.push(disposable);



		
	let checkIfKeyIsSet  = (key: string | undefined) => { return (key !== undefined && (<any>key) !== '' ); };
	const credentialArray: Array<string | undefined> = [
		vscode.workspace.getConfiguration().get('vscodeTweet.consumer_key'),
		vscode.workspace.getConfiguration().get('vscodeTweet.consumer_secret'),
		vscode.workspace.getConfiguration().get('vscodeTweet.access_token_key'),
		vscode.workspace.getConfiguration().get('vscodeTweet.access_token_secret'),
	];

	if (!credentialArray.every(checkIfKeyIsSet)) {
		// credential not fully set
		// show error modal tell users to set credentials..
		vscode.window.showErrorMessage('VSCODE TWEET / You have not setup your Twitter API credentials. Set it up and then reload vscode tweet.', {modal: true}, {title: 'Setup Credentials'}).then((value) => {
			if (value !== undefined) {
					vscode.commands.executeCommand('workbench.action.openGlobalSettings');
			} else 
			{
				vscode.window.showErrorMessage('You need to set up your Twitter API credentials, then reload VSCODE TWEET!');
			}
		});
	}
	// initialize vscode-tweet
	execute(credentialArray, context);
}


function  execute(credentialArray: Array<string | undefined>, context: any) {
	let client = new Twitter({
		consumer_key: (<string>credentialArray[0]),
		consumer_secret: (<string>credentialArray[1]),
		access_token_key: (<string>credentialArray[2]),
		access_token_secret: (<string>credentialArray[3])
	  });

	  // Register providers
	vscode.window.registerTreeDataProvider('postTweets', new PostTweetProvider(client));

	new TimeLine(context, client);
	new UserWall(context, client);

	vscode.window.registerTreeDataProvider('trending', new TrendingTweetsProvider(client));
	TrendingRefresh();
	vscode.window.registerTreeDataProvider('vscodeTweetSettings', new SettingsProvider());

	new TimelineCommands(client);
	new UserWallCommands(client);

}

// this method is called when your extension is deactivated
export function deactivate() {}
