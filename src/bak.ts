import * as vscode from 'vscode';
import * as path from 'path';

export  class TimeLineNodeProvider implements vscode.TreeDataProvider<Tweet> {

    private _onDidChangeTreeData: vscode.EventEmitter<Tweet | undefined> = new vscode.EventEmitter<Tweet | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Tweet | undefined> = this._onDidChangeTreeData.event;
    

    private tweets: any = [
        {
        name: 'Victor Aremu',
        username: '@ahkohd',
        time: '2 min ago',
        content: 'lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem',
        id: 1
        },
        {
            name: 'Victor Aremu',
            username: '@ahkohd',
            time: '2 min ago',
            content: 'lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem',
            id: 2
        }
    ];

    private currentIndex: number = 0;

    constructor(private settings: any) {
    }

    
    refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Tweet): vscode.TreeItem {
		return element;
    }
    
    getChildren(element?: Tweet): Thenable<Tweet[]> {
        return Promise.resolve(this.getTweets());
    }
    
    getTweets() {

        if (this.currentIndex <= this.tweets.length) {
            this.currentIndex++;
            return [new Tweet(this.tweets[this.currentIndex-1].name, this.tweets[this.currentIndex-1].content, this.tweets[this.currentIndex-1].username,  this.tweets[this.currentIndex-1].time, 'header', vscode.TreeItemCollapsibleState.Expanded)];
        } else
        {
            return [];
        }
        
    }

}


export class Tweet extends vscode.TreeItem {

	constructor(
		public readonly label: string,
        private tweetContent: string,
        private username: string,
        private time: string,
        private type: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
    }
    
    // get id(): string {
    //     if (this.type === 'header') {
    //         return `h-${this.username}-js`;
    //     } else
    //     {
    //         return `c-${this.username}-js`;
//     }
    // }

	get tooltip(): string {
        if (this.type === 'header') {
    		return `${this.label} ${this.username} ● ${this.time}`;
        } else
        {
    		return `${this.tweetContent}`;
        }
	}

	get description(): string {
        if (this.type === 'header') {
        		return `${this.username} ● ${this.time}`;
        } else
        {
                return `${this.tweetContent}`;
        }
    }
    

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources',  'icon.svg'),
		dark: path.join(__filename, '..', '..', 'resources',  'icon.svg')
	};

	contextValue = 'tweet';

}