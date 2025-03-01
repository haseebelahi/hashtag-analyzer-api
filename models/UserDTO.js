class UserDTO {
    constructor(rawTweetObj) {
        this.screen_name = rawTweetObj.screen_name;
        this.username = rawTweetObj.username;
        this.tweet_time = rawTweetObj.time.format('LLLL');
        this.avatar_img = rawTweetObj.avatar_img;
        return this;
    }
}
module.exports = UserDTO;