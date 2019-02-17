import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export default class SettingsProvider implements vscode.TreeDataProvider<Item> {

    private _onDidChangeTreeData: vscode.EventEmitter<Item | undefined> = new vscode.EventEmitter<Item | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Item | undefined> = this._onDidChangeTreeData.event;


    constructor() {

        /// when refresh command is invoked...
        vscode.commands.registerCommand('vscodeTweet.clearCache', () => {
              this.rmDir(path.join(__filename, '..', '..', 'resources', 'profilePictures'), false);
        });

        // when open with hash tag is invoked...
        vscode.commands.registerCommand('settings.openVScodeTweetSettings', () => {
            // vscode.window.

        });


        vscode.commands.registerCommand('vscodeTweet.about', () => vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://github.com/ahkohd/vscode-tweet`)));

    }


    rmDir(dirPath: string,  removeSelf?: boolean )  {
        try { 
            let files = fs.readdirSync(dirPath);
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    let filePath = dirPath + '/' + files[i];
                    if (fs.statSync(filePath).isFile()) {
                      fs.unlinkSync(filePath);
                    } else {
                      this.rmDir(filePath);
                    }
                }
            }
              
            fs.rmdirSync(dirPath);
         }
        catch(e) { return; }
      }
    
    




    fetchTrending(): Thenable<any> {
        return Promise.resolve([
            new Item ('Open VSCODE TWEET Settings', '', vscode.TreeItemCollapsibleState.None, {command: 'settings.openVScodeTweetSettings', title: 'Open VSCODE TWEET Settings.'}),
            new Item ('Clear Tweets Profile Pictures Cache', '', vscode.TreeItemCollapsibleState.None, {command: 'vscodeTweet.clearCache', title: 'Clear tweets profile picture cache.'}),
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
    
    get description(): string
    {
        return this.desc;
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