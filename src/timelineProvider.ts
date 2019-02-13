import * as vscode from 'vscode';
import * as path from 'path';
import * as Twitter from 'twitter';
// import * as http from 'http';


export interface TweetNode {
	label: string;
    username: string;
    time: string;
    content: string;
    type: string;
    id: string;
}

export class TweetModel 
{
    private nodes: Map<string, TweetNode> = new Map<string, TweetNode>();

    
    constructor(private client: Twitter) {
    }
    

    getRawTweets(): Promise<Twitter.ResponseData> {
        
        return new Promise((callback, error) => {
            this.client.get('statuses/user_timeline', function(err, tweets, response) {
                if (err){
                    // let's return sample tweets...
                    error('Error Unable to get tweets: ' + err.message);
                } 
                callback(tweets);
            });
        });  
    }

    fetchTweets(): Thenable<any>
    {

        return new Promise((callback, error) => {
            this.getRawTweets().then(rawTweets => {
                // raw tweets is now gotten... lets us manipuate it :)

                let tweets = [
                    {
                        label: 'Victor Aremu',
                        username: '@Ahkohd',
                        time: '2 min ago',
                        content: 'lorem lorem lorem lorem lorem lorem lorem  lorem lorem lorem lorem lorem lorem \n💬 (15)    ❤️ (10)    🔁 (2)',
                        id: '1094374464534573056',
                        type: 'head',
                
                    },
                    {
                        label: 'Victor Aremu',
                        username: '@Ahkohd',
                        time: '2 min ago',
                        content: 'lorem lorem lorem lorem lorem lorem lorem\n lorem lorem lorem lorem lorem lorem \n💬 (15)    ❤️ (10)    🔁 (2)  ',
                        id: '1091810321914826752',
                        type: 'head',
            
                    }
                ];


                callback(tweets);
            }).catch(err => {
                // opps! an error occured...
                error(err);
            });
        });
        

        //  let tweets = [
        //     {
        //         label: 'Victor Aremu',
        //         username: '@Ahkohd',
        //         time: '2 min ago',
        //         content: 'lorem lorem lorem lorem lorem lorem lorem  lorem lorem lorem lorem lorem lorem \n💬 (15)    ❤️ (10)    🔁 (2)',
        //         id: '1094374464534573056',
        //         type: 'head',
        
        //     },
        //     {
        //         label: 'Victor Aremu',
        //         username: '@Ahkohd',
        //         time: '2 min ago',
        //         content: 'lorem lorem lorem lorem lorem lorem lorem\n lorem lorem lorem lorem lorem lorem \n💬 (15)    ❤️ (10)    🔁 (2)  ',
        //         id: '1091810321914826752',
        //         type: 'head',
    
        //     }
        // ];
        // return Promise.resolve(tweets);
    }

    public get roots(): Thenable<TweetNode[]> {
		return this.fetchTweets().then(tweets => {
			return  tweets;
		});
    }
    

    public getChildren(node: TweetNode): Thenable<TweetNode[]> {
        let content: string = node.content;
        let newLines: string[] = content.split('\n');
        let childs: TweetNode[] = [];
        for (let i =0; i < newLines.length; i++)
        {
            // creates the tweet content node...
            childs.push({label: '', content: newLines[i], username: node.username, time: '', type: 'body', id: node.id});
        }
        return Promise.resolve(childs);
    }
    
}


export class TimelineProvider implements vscode.TreeDataProvider<TweetNode> {
   
    private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
    readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;
    
    constructor(private readonly model: TweetModel) { }

    public refresh(): any {
		this._onDidChangeTreeData.fire();
    }
    
    public getTreeItem(element: TweetNode): vscode.TreeItem {

        // represents both the tweet head and body
		return {
            label: element.label,
            description: (element.type === 'head') ? `${element.username} ● ${element.time}` : `${element.content}`,
            tooltip: (element.type === 'head') ? `${element.username} ● ${element.time}` : undefined,
            iconPath: (element.type === 'head') ? { light: path.join(__filename, '..', '..', 'resources',  'icon.svg'), dark: path.join(__filename, '..', '..', 'resources',  'entry.svg')} : undefined,
            collapsibleState: (element.type === 'head') ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None,
            command: (element.type === 'head') ? undefined : {command: 'extension.tweetInBrowser',title: '',arguments: [(element.username.split('@'))[1], element.id]},
        	contextValue: (element.type === 'head') ? 'tweet-head' : 'tweet-body'
        };
    }
    
    public getChildren(element?: TweetNode): TweetNode[] | Thenable<TweetNode[]> {
		return element ? this.model.getChildren(element) : this.model.roots;
    }
    
    public getParent(element: TweetNode): TweetNode {
        // creates the tweet head....
		if (element.type === 'head') {
            return {label: element.label, time: element.time, username: element.username, type: 'head', content: '', id: element.id};
        } else
        {
            return {label: '',  time: '', username: element.username, type: 'body', content: element.content, id: element.id};
        }
    }


}

export class TimeLine {
    private timeline: vscode.TreeView<TweetNode>;

    constructor(context: vscode.ExtensionContext, client: Twitter) {
        const tweetModel = new TweetModel(client);
		const treeDataProvider = new TimelineProvider(tweetModel);
        this.timeline = vscode.window.createTreeView('twitterTimeline', { treeDataProvider });
        // register commands...
        // 1. open tweet in browser ...
        vscode.commands.registerCommand('extension.tweetInBrowser', (screen_name, tweet_id) => vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://www.twitter.com/${screen_name}/status/${tweet_id}`)));
		vscode.commands.registerCommand('twitterTimeline.refresh', () => treeDataProvider.refresh());
	}
}