import * as vscode from 'vscode';
import * as Twitter from 'twitter';
import { TweetNode } from './timelineProvider';

export default class TimelineCommands
{
  constructor(client: Twitter)
  {


    // Register retweet...
    vscode.commands.registerCommand('twitterTimeline.retweet', (node: any | TweetNode) => {
            vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Retweeting...');
            client.post('statuses/retweet', {id: node.id}, (error, tweet, resonse) => {

                if (error) {
                        vscode.commands.executeCommand('vscode-tweet.showMsg', 'err', 'Unable to  retweet. Error: '+error.message);
                } else
                {
                    if(node.favorited) {
                            node.contextValue = 'tweet-head-fav-r';
                    } else {
                        node.contextValue = 'tweet-head-nofav-r';
                    }


                    node.retweeted = true;
                    vscode.commands.executeCommand('twitterTimeline.refresh', node);
                    vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Retweeted!');
                }

            });
    });


     // Register unretweet...
     vscode.commands.registerCommand('twitterTimeline.unretweet', (node: any | TweetNode) => {
        vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Un-Retweeting...');
        client.post('statuses/unretweet', {id: node.id}, (error, tweet, resonse) => {

            if (error) {
                    vscode.commands.executeCommand('vscode-tweet.showMsg', 'err', 'Unable to  Un-retweet. Error: '+error.message);
            } else
            {
                if(node.favorited) {
                        node.contextValue = 'tweet-head-fav';
                } else {
                    node.contextValue = 'tweet-head-nofav';
                }
                node.retweeted = false;
                vscode.commands.executeCommand('twitterTimeline.refresh', node);
                vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Un-Retweeted!');
            }

        });
    });

    // reply timeline tweets...
    vscode.commands.registerCommand('twitterTimeline.reply', (node: TweetNode) => {
        
        vscode.window.showInputBox({placeHolder: 'Tweet Your Reply', ignoreFocusOut: true}).then((value)=>{

            if (value  !== undefined) {
            // Reply post
            vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Replying Tweet...');
            client.post('statuses/update', {status: `@${node.username} ${value}`, in_reply_to_status_id: node.id},  function(error, tweet, response) {
                if (error) {
                    
                        vscode.commands.executeCommand('vscode-tweet.showMsg', 'err', 'Unable to reply Tweet. Error: '+error.message);
                } else
                {
                    vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Tweet Replied!');
                }
            });
                
            } else {
                vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' You have to enter a reply!');
            }            
        });
    });


    // Register retweet...
    vscode.commands.registerCommand('twitterTimeline.like', (node: TweetNode) => {
        vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Faving Tweet...');
            client.post('favorites/create', {id: node.id}, (error, tweet, resonse) => {

                if (error) {
                        vscode.commands.executeCommand('vscode-tweet.showMsg', 'err', 'Unable to favorite tweet. Error: '+error.message);
                } else
                {
                    node.favorited = true;
                    vscode.commands.executeCommand('twitterTimeline.refresh', node);
                    vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Tweet Favourited!');
                }

            });
    });

     // Register retweet...
     vscode.commands.registerCommand('twitterTimeline.unlike', (node: TweetNode) => {
        vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Unfaving Tweet...');
        client.post('favorites/destroy', {id: node.id}, (error, tweet, resonse) => {

            if (error) {
                    vscode.commands.executeCommand('vscode-tweet.showMsg', 'err', 'Unable to unfavorite tweet. Error: '+error.message);
            } else
            {
                node.favorited = false;
                vscode.commands.executeCommand('twitterTimeline.refresh', node);
                vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Tweet Un-favorited!');
            }

        });
    });

    
  }
}