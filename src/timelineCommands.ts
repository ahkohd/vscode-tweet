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

                    // logics to parse text content and update the string with the latest retweet count...
                    let updateContent = node.content;
                    let chunck = updateContent.split('🔁');
                    // replace all none number chacter with nothing and the convert to number...
                    let count = Number.parseInt((chunck[1]).match(/\d+/)[0]);
                    console.log(count);
                    updateContent = `${chunck[0]}🔁 (${count+1})`;
                    node.content = updateContent;

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

                 // logics to parse text content and update the string with the latest retweet count...
                 let updateContent = node.content;
                 let chunck = updateContent.split('🔁');
                 // replace all none number chacter with nothing and the convert to number...
                 let count = Number.parseInt((chunck[1]).match(/\d+/)[0]);
                 console.log(count);
                 updateContent = `${chunck[0]}🔁 (${count-1})`;
                 node.content = updateContent;


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

                    // logics to parse text content and update the string with the latest favourite...
                    let updateContent = node.content;
                    let chunck: string[] = updateContent.split('❤️');
                    let chunck1 = (chunck[1].split('🔁'))[0];
                    // replace all none number chacter with nothing and the convert to number...
                    let count = Number.parseInt((<any>chunck1).match(/\d+/)[0]);
                    console.log('fav', count);
                    updateContent = `${chunck[0]}❤️ (${count+1})    🔁${(updateContent.split('🔁'))[1]}`;
                    node.content = updateContent;


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

                  // logics to parse text content and update the string with the latest favourite...
                  let updateContent = node.content;
                  let chunck: string[] = updateContent.split('❤️');
                  let chunck1 = (chunck[1].split('🔁'))[0];
                  // replace all none number chacter with nothing and the convert to number...
                  let count = Number.parseInt((<any>chunck1).match(/\d+/)[0]);
                  console.log('fav', count);
                  updateContent = `${chunck[0]}❤️ (${count-1})    🔁${(updateContent.split('🔁'))[1]}`;
                  node.content = updateContent;


                vscode.commands.executeCommand('twitterTimeline.refresh', node);
                vscode.commands.executeCommand('vscode-tweet.showMsg', 'info', ' Tweet Un-favorited!');
            }

        });
    });

    
  }
}