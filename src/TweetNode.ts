export default interface TweetNode {
	label: string;
    username: string;
    time: string;
    content: string;
    type: string;
    id: string;
    favorited: boolean;
    retweeted: boolean;
    user_pics: string;
    user_mentions: null | string[];
    isRetweet: boolean;
}
