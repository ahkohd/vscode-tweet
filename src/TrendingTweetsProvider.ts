import * as vscode from 'vscode';
import * as path from 'path';
import * as Twitter from 'twitter';

export interface TagNode 
{
    label: string;
    url: string;
    tweetVolume: string;
}

export  class TrendingTweetsProvider implements vscode.TreeDataProvider<Item> {

    private _onDidChangeTreeData: vscode.EventEmitter<Item | undefined> = new vscode.EventEmitter<Item | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Item | undefined> = this._onDidChangeTreeData.event;


    constructor(public client: Twitter) {

        /// when refresh command is invoked...
        vscode.commands.registerCommand('trending.refresh', () => {
            this.refresh();
        });

        // when open with hash tag is invoked...
        vscode.commands.registerCommand('extension.openTrendingInBrowser', (url) => {
                vscode.commands.executeCommand('vscode.open', vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url)));
        });

    }

    
    refresh(): void {   
		this._onDidChangeTreeData.fire();
	}



    getRawTrending(): Promise<Twitter.ResponseData> {
        return new Promise((callback, error) => {
            this.client.get('trends/place.json', {id: 1}, function(err, tweets, response) {
                if (err){
                    vscode.commands.executeCommand('vscode-tweet.showMsg', 'err', ' Unable to fetch Trending Hash Tags. Error: '+err.message);
                    error('Error Unable to get tweets: ' + err.message);
                } else {
                    vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Loading Trending Hash Tags...');
                    callback(tweets[0].trends);
                }
                
            });
        });  
    }

    fetchTrending(): Thenable<any> {
        vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Fetching Trending Hash Tags!');
        return new Promise((callback, error) => {
            this.getRawTrending().then(rawTweets => {
                let trends: Item[] = [];
                for (let i = 0; i < rawTweets.length; i++)
                {
                    trends.push(new Item((rawTweets[i].name.indexOf('#') !== 0) ? '#'+rawTweets[i].name: rawTweets[i].name, `${rawTweets[i].name} ${(rawTweets[i].tweet_volume) ? '/ ('+rawTweets[i].tweet_volume+')' :  ''}`, rawTweets[i].tweet_volume, vscode.TreeItemCollapsibleState.None, {command: 'extension.openTrendingInBrowser', title: 'Open trending HashTag',  arguments: [rawTweets[i].url]}));
                }
                callback(trends);
            }).catch(err => {
                // opps! an error occured...
                error(err);
            });
        });
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
        private tweetVolume: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
    }
    
    get description(): string
    {
        return `${(this.tweetVolume) ? '('+this.tweetVolume+')' :  ''}`;
    }

	get tooltip(): string {
    		return this.desc;
	}


	iconPath = {
		light: path.join(__filename, '..', '..', 'resources',  'tag.svg'),
		dark: path.join(__filename, '..', '..', 'resources',  'tag.svg')
	};

	contextValue = 'trending';

}