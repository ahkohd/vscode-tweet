import * as vscode from 'vscode';
import * as Twitter from 'twitter';
import { TweetNode } from './timelineProvider';

export default class CommonCommands
{
  constructor(client: Twitter)
  {


    // // Register retweet...
    vscode.commands.registerCommand('postTweets.tweet', () => {

    });

    // Register retweet...
    vscode.commands.registerCommand('twitterTimeline.like', (node: TweetNode) => {
            client.post('favorites/create', {id: node.id}, (error, tweet, resonse) => {

                if (error) {
                    try {
                        vscode.commands.executeCommand('vscode-tweet.showMsg', 'err', 'Unable to favorite tweet. Error: '+error[0].message);
                    } catch(e)
                    {
                        throw "Unable to favorite tweet and notify user about it";
                    }
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
        client.post('favorites/destroy', {id: node.id}, (error, tweet, resonse) => {

            if (error) {
                try {
                    vscode.commands.executeCommand('vscode-tweet.showMsg', 'err', 'Unable to unfavorite tweet. Error: '+error[0].message);
                } catch(e)
                {
                    throw "Unable to unfavorite tweet and notify user about it";
                }
            } else
            {
                node.favorited = false;
                vscode.commands.executeCommand('twitterTimeline.refresh', node);
                vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Tweet Un-favorited!');
            }

        });
    });

     // Register retweet...
     vscode.commands.registerCommand('twitterTimeline.reply', () => {

    });
  }
}