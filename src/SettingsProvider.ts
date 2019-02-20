import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export default class SettingsProvider implements vscode.TreeDataProvider<Item> {

    private _onDidChangeTreeData: vscode.EventEmitter<Item | undefined> = new vscode.EventEmitter<Item | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Item | undefined> = this._onDidChangeTreeData.event;


    constructor() {

        /// when refresh command is invoked...
        vscode.commands.registerCommand('vscodeTweet.clearCache', () => {
                vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Clearing Tweets profile picture cache...');
                this.rmDir(path.join(__filename, '..', '..', 'resources', 'profilePictures'), false);
        });

        // when open with hash tag is invoked...
        vscode.commands.registerCommand('settings.openVScodeTweetSettings', () => {
            vscode.commands.executeCommand('workbench.action.openGlobalSettings');
        });

        vscode.commands.registerCommand('vscodeTweet.about', () => vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://github.com/ahkohd/vscode-tweet`)));

    }


    rmDir(dirPath: string,  removeSelf?: boolean )  {
                if (removeSelf === undefined) {
                    removeSelf = true;
                }
                try {
                     var files = fs.readdirSync(dirPath);
                } catch(e) {
                    vscode.commands.executeCommand('vscode-tweet.showMsg', 'err', ' Unable to clear tweets profile picture cache...');
                    return;
                }
                if (files.length > 0) {
                    for (var i = 0; i < files.length; i++) {
                    let filePath = dirPath + '/' + files[i];
                    if (fs.statSync(filePath).isFile()) {
                        fs.unlinkSync(filePath);
                    } else {
                        this.rmDir(filePath);
                    }
                    vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', 'Successfully cleared cached tweets profile picture...');
                }
                if (removeSelf) {
                    fs.rmdirSync(dirPath);
                }
               } else {
                    vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', 'Ops! No profile picture cached...');
               }

      }
    
    




    fetchTrending(): Thenable<any> {
        return Promise.resolve([
            new Item ('Open VSCODE TWEET Settings', '', vscode.TreeItemCollapsibleState.None, {command: 'settings.openVScodeTweetSettings', title: 'Open VSCODE TWEET Settings.'}),
            new Item ('Reload VSCODE TWEET', 'Use to reload vscode tweet after change in twitter API configuration', vscode.TreeItemCollapsibleState.None, {command: 'workbench.action.reloadWindow', title: 'Reload VSCODE TWEET'}),
            new Item ('Clear Tweets Profile Picture Cache', '', vscode.TreeItemCollapsibleState.None, {command: 'vscodeTweet.clearCache', title: 'Clear tweets profile picture cache.'}),
            new Item ('About VSCODE TWEET', '', vscode.TreeItemCollapsibleState.None, {command: 'vscodeTweet.about', title: 'Open About VSCODE TWEET'})
        ]);
    }

    getTreeItem(element: Item): vscode.TreeItem {
		return element;
    }

    public get roots(): Thenable<Item[]> {
		return this.fetchTrending().then(trends => {
			return  trends;
		});
    }
    

    getChildren(node?: Item): Thenable<Item[]> {
        return Promise.resolve(this.fetchTrending());
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
		light: path.join(__filename, '..', '..', 'resources',  'cog.svg'),
		dark: path.join(__filename, '..', '..', 'resources',  'cog.svg')
	};

	contextValue = 'settings';

}