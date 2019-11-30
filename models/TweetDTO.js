class TweetDTO {
    constructor(rawTweetObj) {
        this.screen_name = rawTweetObj.screen_name;
        this.username = rawTweetObj.username;
        this.html = rawTweetObj.html;
        this.url = rawTweetObj.url;
        this.time = rawTweetObj.time.format('LLLL');
        this.likes = rawTweetObj.likes;
        this.replies = rawTweetObj.replies;
        this.retweets = rawTweetObj.retweets;
        return this;
    }
}
module.exports = TweetDTO;