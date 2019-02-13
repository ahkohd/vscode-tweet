import * as vscode from 'vscode';
import * as path from 'path';
// import * as http from 'http';

export interface TweetNode {
	label: string;
    username: string;
    time: string;
    content: string;
    type: string;
}

export class TweetModel 
{
    private nodes: Map<string, TweetNode> = new Map<string, TweetNode>();
    
    constructor() {
    }
    
    fetchTweets(): Thenable<any>
    {
        let tweets = [
                {
                    label: 'Victor Aremu',
                    username: '@ahkohd',
                    time: '2 min ago',
                    content: 'lorem lorem lorem lorem lorem lorem lorem  lorem lorem lorem lorem lorem lorem \n💬 (15)    ❤️ (10)    🔁 (2)',
                    id: 1,
                    type: 'head'
                },
                {
                    label: 'Victor Aremu',
                    username: '@ahkohd',
                    time: '2 min ago',
                    content: 'lorem lorem lorem lorem lorem lorem lorem  \n lorem lorem lorem lorem lorem lorem \n💬 (15)    ❤️ (10)    🔁 (2)  ',
                    id: 2,
                    type: 'head'

                }
            ];
            return Promise.resolve(tweets);
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
            childs.push({label: '', content: newLines[i], username: '', time: '', type: 'body'});
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
		return {
            label: element.label,
            description: (element.type === 'head') ? `${element.username} ● ${element.time}` : `${element.content}`,
            tooltip: (element.type === 'head') ? `${element.username} ● ${element.time}` : undefined,
            iconPath: (element.type === 'head') ? { light: path.join(__filename, '..', '..', 'resources',  'icon.svg'), dark: path.join(__filename, '..', '..', 'resources',  'entry.svg')} : undefined,
            collapsibleState: (element.type === 'head') ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None
        };
    }
    
    public getChildren(element?: TweetNode): TweetNode[] | Thenable<TweetNode[]> {
		return element ? this.model.getChildren(element) : this.model.roots;
    }
    
    public getParent(element: TweetNode): TweetNode {
		if (element.type === 'head') {
            return {label: element.label, time: element.time, username: element.username, type: 'head', content: ''};
        } else
        {
            return {label: '',  time: '', username: '', type: 'body', content: element.content};
        }
    }


}

export class TimeLine {
    private timeline: vscode.TreeView<TweetNode>;

    constructor(context: vscode.ExtensionContext) {
		const tweetModel = new TweetModel();
		const treeDataProvider = new TimelineProvider(tweetModel);
		this.timeline = vscode.window.createTreeView('twitterTimeline', { treeDataProvider });

		vscode.commands.registerCommand('twitterTimeline.refresh', () => treeDataProvider.refresh());
	}
}