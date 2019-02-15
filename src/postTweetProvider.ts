import * as vscode from 'vscode';
import * as path from 'path';
import * as Twitter from 'twitter';


export  class PostTweetProvider implements vscode.TreeDataProvider<Item> {

    private _onDidChangeTreeData: vscode.EventEmitter<Item | undefined> = new vscode.EventEmitter<Item | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Item | undefined> = this._onDidChangeTreeData.event;


    constructor(client: Twitter) {

        vscode.commands.registerCommand('postTweets.tweet', () => {
            vscode.window.showInputBox({placeHolder: 'What\'s happening?', ignoreFocusOut: true}).then((value)=>{

                    if (value  !== undefined) {
                    // update post

                        vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Posting Tweet...');
                        client.post('statuses/update', {status: value},  function(error, tweet, response) {
                            if (error) {
                                try {
                                    vscode.commands.executeCommand('vscode-tweet.showMsg', 'err', 'Unable to post Tweet. Error: '+error[0].message);
                                } catch(e)
                                {
                                    throw "Unable to post tweet and notify user about it";
                                }
                            } else
                            {
                                vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Tweet Posted!');
                            }
                        });

                    }


            });
        });

    }

    
    refresh(): void {   
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Item): vscode.TreeItem {
		return element;
    }
    
    getChildren(element?: Item): Thenable<Item[]> {
            return Promise.resolve([new Item('Post new Tweet', 'Post new Tweet', vscode.TreeItemCollapsibleState.None, {command: 'postTweets.tweet', title: 'Post new Tweet'})]);
    }

}


export class Item extends vscode.TreeItem {

	constructor(
		public readonly label: string,
        private desc: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
    }
    

	get tooltip(): string {
    		return this.desc;
	}


	iconPath = {
		light: path.join(__filename, '..', '..', 'resources',  'entry2.svg'),
		dark: path.join(__filename, '..', '..', 'resources',  'entry2.svg')
	};

	contextValue = 'tweet';

}