import * as vscode from 'vscode';
import * as path from 'path';
import * as Twitter from 'twitter';
const timeago = require('node-time-ago');
import * as fs from 'fs';
const download = require('image-downloader');


export interface TweetNode {
	label: string;
    username: string;
    time: string;
    content: string;
    type: string;
    id: string;
    favorited: boolean;
    retweeted: boolean;
    user_pics: string;
}

export class TweetModel 
{
    private nodes: Map<string, TweetNode> = new Map<string, TweetNode>();

    
    constructor(private client: Twitter) {

    }
    

    getRawTweets(): Promise<Twitter.ResponseData> {

        return new Promise((callback, error) => {
            this.client.get('statuses/home_timeline.json?count=40?exclude_replies', function(err, tweets, response) {
                if (err){
                    // let's return sample tweets...
            
                    try {
                        vscode.commands.executeCommand('vscode-tweet.showMsg', 'err', ' Unable to fetch tweets. Error: ' + err[0].message);
                    } catch(e) {
                        throw "Error occured while fetching tweets and was unable to alert user";
                    
                    }
                    error('Error Unable to get tweets: ' + err.message);
                } 
                vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Loading Tweets...');
                callback(tweets);
            });
        });  
    }

    chunkifyTweet(a: any[], n: number, balanced: boolean) {
    
        if (n < 2) {
            return [a];
        }
    
        let len = a.length,
                out = [],
                i = 0,
                size;
    
        if (len % n === 0) {
            size = Math.floor(len / n);
            while (i < len) {
                out.push(a.slice(i, i += size));
            }
        }
    
        else if (balanced) {
            while (i < len) {
                size = Math.ceil((len - i) / n--);
                out.push(a.slice(i, i += size));
            }
        }
    
        else {
    
            n--;
            size = Math.floor(len / n);
            if (len % size === 0) {  size--; }
            while (i < size * n) {
                out.push(a.slice(i, i += size));
            }
            out.push(a.slice(size * n));
    
        }
    
        return out;
    }

    prepaireTweets(rawTweets: any): Array<TweetNode> {

        let limitPerLine = (text: string, limit: number) => {
            let eachLines = this.chunkifyTweet(text.split(' '), limit,  false);
                for(let i =0; i < eachLines.length; i++)
                {
                    eachLines[i] = eachLines[i].reduce((prev, current) => {
                            return prev +' '+current;
                    });
                } 
            return (eachLines.join('\n'));

        };
            let out: TweetNode[] = [];
            for( let i = 0; i < rawTweets.length; i++) {
                out.push({
                    label: rawTweets[i].user.name,
                    username: '@'+rawTweets[i].user.screen_name,
                    time: timeago(rawTweets[i].created_at, 'en_US'),
                    id: rawTweets[i].id_str,
                    type: 'head',
                    favorited: rawTweets[i].favorited,
                    retweeted: rawTweets[i].retweeted,
                    user_pics: rawTweets[i].user.profile_image_url,
                    content: `${(rawTweets[i].text.length >= 100) ? limitPerLine(rawTweets[i].text, 3) :  rawTweets[i].text}  \n❤️ (${rawTweets[i].favorite_count})    🔁 (${rawTweets[i].retweet_count})`
                });
                this.getProfilePicture('@'+rawTweets[i].user.screen_name, rawTweets[i].user.profile_image_url)
                
            }

            return out;
    }


    getProfilePicture(username: string, pics_url: string) : void
    {

        let pics_exists = this.pathExists(path.join(__filename, '..', '..', 'resources', 'profilePictures', username+'.jpg'));

        if (!pics_exists) {
            // console.log(username, "pic does not exits");
            const options = {
                url: pics_url,
                dest: path.join(__filename, '..', '..', 'resources', 'profilePictures', username+'.jpg')                
              };

              async function downloadIMG() {
                try {
                  const { filename, image } = await download.image(options);
                //   console.log(filename); 
                } catch (e) {
                //   console.error(e);
                }
              }
               
              downloadIMG();

        } else
        {
            // console.log(username, "pic does  exits");
        }
    }

    private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}

    fetchTweets(): Thenable<any>
    {
        vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Fetching Tweets!');

        return new Promise((callback, error) => {
            this.getRawTweets().then(rawTweets => {
                // raw tweets is now gotten... lets us manipuate it :) to look like below...
                console.log(rawTweets[4]);


                let tweets = this.prepaireTweets(rawTweets);
                callback(tweets);
            }).catch(err => {
                // opps! an error occured...
                error(err);
            });
        });


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
            childs.push({label: '', content: newLines[i], username: node.username,
             time: '', type: 'body', id: node.id,
                favorited: node.favorited,
             retweeted: node.retweeted,
             user_pics: '',});
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
            description: (element.type === 'head') ? `${element.username}  ●  ${element.time}` : `${element.content}`,
            tooltip: (element.type === 'head') ? `${element.label} ${element.username}  ●  ${element.time}` : undefined,
            iconPath: (element.type === 'head') ? { light: path.join(__filename, '..', '..', 'resources', 'profilePictures', element.username+'.jpg'), dark: path.join(__filename, '..', '..', 'resources', 'profilePictures', element.username+'.jpg')} : undefined,
            // iconPath: (element.type === 'head') ? { light: path.join(__filename, '..', '..', 'resources',  'icon.svg'), dark: path.join(__filename, '..', '..', 'resources',  'entry.svg')} : undefined,
            collapsibleState: (element.type === 'head') ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None,
            command: (element.type === 'head') ? undefined : {command: 'extension.tweetInBrowser',title: '',arguments: [(element.username.split('@'))[1], element.id]},
        	contextValue: (element.type === 'head') ? (element.favorited) ? 'tweet-head-fav' : 'tweet-head-nofav' : 'tweet-body'
        };
    }
    
    public getChildren(element?: TweetNode): TweetNode[] | Thenable<TweetNode[]> {
		return element ? this.model.getChildren(element) : this.model.roots;
    }
    
    public getParent(element: TweetNode): TweetNode {
        // creates the tweet head....
		if (element.type === 'head') {
            return {label: element.label, time: element.time, username: element.username, type: 'head', content: '', id: element.id,
            favorited: element.favorited,
            retweeted: element.retweeted,
            user_pics: element.user_pics,
        };
        } else
        {
            return {label: '',  time: '', username: element.username, type: 'body', content: element.content, id: element.id,
            favorited: element.favorited,
            retweeted: element.retweeted,
            user_pics: '',};
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