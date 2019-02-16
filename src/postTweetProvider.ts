import * as vscode from 'vscode';
import * as path from 'path';
import * as Twitter from 'twitter';
import * as fs from 'fs';
const download = require('image-downloader');

export  class PostTweetProvider implements vscode.TreeDataProvider<Item> {

    private _onDidChangeTreeData: vscode.EventEmitter<Item | undefined> = new vscode.EventEmitter<Item | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Item | undefined> = this._onDidChangeTreeData.event;


    constructor(private client: Twitter) {

        vscode.commands.registerCommand('postTweets.tweet', () => {
            vscode.window.showInputBox({placeHolder: 'What\'s happening?', ignoreFocusOut: true}).then((value)=>{

                    if (value  !== undefined) {
                    // update post

                        vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Posting Tweet...');
                        client.post('statuses/update', {status: value},  function(error, tweet, response) {
                            if (error) {
                                
                                    vscode.commands.executeCommand('vscode-tweet.showMsg', 'err', 'Unable to post Tweet. Error: '+error.message);
                            } else
                            {
                                vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Tweet Posted!');
                            }
                        });

                    }


            });
        });

         // when open with hash tag is invoked...
         vscode.commands.registerCommand('extension.openUserTwitterProfile', (username) => {
            vscode.commands.executeCommand('vscode.open', vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://twitter.com/${username}`)));
        });

    }

    getRawUserInfo(): Promise<Twitter.ResponseData> {
        return new Promise((callback, error) => {
            this.client.get('account/verify_credentials', {include_entities: false, skip_status: 1}, function(err, profile, response) {
                if (err){
                    vscode.commands.executeCommand('vscode-tweet.showMsg', 'err', ' Unable to fetch Profile. Error: '+err.message);
                    error('Error Unable to get profile: ' + err.message);
                } else {
                    // vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Loading Trending Hash Tags...');
                    callback(profile);
                }
                
            });
        });  
    }


    fetchProfile(): Thenable<any> {
        vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', 'Fetching...');
        return new Promise((callback, error) => {
            this.getRawUserInfo().then(profile => {
                  
                this.getProfilePicture('@'+profile.screen_name, profile.profile_image_url).then(()=>{
                    callback([
                        new Item(`Howdy, ${profile.name}`, '@'+profile.screen_name, '@'+profile.screen_name, vscode.TreeItemCollapsibleState.None, {command: 'extension.openUserTwitterProfile', title: 'Open User Profile',  arguments: [profile.screen_name]}),
                        new Item(`@${profile.screen_name}`, '', 'tag', vscode.TreeItemCollapsibleState.None, {command: 'extension.openUserTwitterProfile', title: 'Open User Profile',  arguments: [profile.screen_name]}),
                        new Item(`${profile.location}`, '', 'location', vscode.TreeItemCollapsibleState.None, {command: 'extension.openUserTwitterProfile', title: 'Open User Profile',  arguments: [profile.screen_name]}),
                        new Item(`Following (${profile.friends_count})   Followers (${profile.followers_count})`, '', 'followers',  vscode.TreeItemCollapsibleState.None, {command: 'extension.openUserTwitterProfile', title: 'Open User Profile',  arguments: [profile.screen_name]}),
                        new Item('Post new Tweet', 'Post new Tweet', 'entry2', vscode.TreeItemCollapsibleState.None,  {command: 'postTweets.tweet', title: 'Post new Tweet'})
                    ]);
                }).catch(()=>{
                    callback([
                        new Item(`Howdy, ${profile.name}`, '@'+profile.screen_name, 'user', vscode.TreeItemCollapsibleState.None, {command: 'extension.openUserTwitterProfile', title: 'Open User Profile',  arguments: [profile.screen_name]}),
                        new Item(`@${profile.screen_name}`, '', 'tag', vscode.TreeItemCollapsibleState.None, {command: 'extension.openUserTwitterProfile', title: 'Open User Profile',  arguments: [profile.screen_name]}),
                        new Item(`${profile.location}`, '', 'location', vscode.TreeItemCollapsibleState.None, {command: 'extension.openUserTwitterProfile', title: 'Open User Profile',  arguments: [profile.screen_name]}),
                        new Item(`Following (${profile.friends_count})   Followers (${profile.followers_count})`, '', 'followers',  vscode.TreeItemCollapsibleState.None, {command: 'extension.openUserTwitterProfile', title: 'Open User Profile',  arguments: [profile.screen_name]}),
                        new Item('Post new Tweet', 'Post new Tweet', 'entry2', vscode.TreeItemCollapsibleState.None,  {command: 'postTweets.tweet', title: 'Post new Tweet'})
                    ]);
                });

            }).catch(err => {
                // opps! an error occured...
                error(err);
            });
        });
    }


   async getProfilePicture(username: string, pics_url: string) : Promise<any>
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
               
             await downloadIMG();
             return pics_exists;

        } else
        {
            // console.log(username, "pic does  exits");
            return pics_exists;
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

    
    refresh(): void {   
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Item): vscode.TreeItem {
		return element;
    }
    
    getChildren(element?: Item): Thenable<Item[]> {
            return Promise.resolve(this.fetchProfile());
    }

}


export class Item extends vscode.TreeItem {

	constructor(
		public readonly label: string,
        private desc: string,
        public iconPathURI: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,

	) {
        super(label, collapsibleState);
    }
    

	get tooltip(): string {
    		return this.desc;
	}


    
    iconPath: any = (this.iconPathURI.indexOf('@') === 0) ? {light: path.join(__filename, '..', '..', 'resources', 'profilePictures', this.iconPathURI+'.jpg'), dark: path.join(__filename, '..', '..', 'resources',  'profilePictures', this.iconPathURI+'.jpg')} : {light: path.join(__filename, '..', '..', 'resources',  this.iconPathURI+'.svg'),dark: path.join(__filename, '..', '..', 'resources',  this.iconPathURI+'.svg')};
	
	contextValue = 'tweet';

}