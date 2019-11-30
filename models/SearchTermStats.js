const dynamoose = require('dynamoose');
const Schema = dynamoose.Schema;

module.exports = new Schema({
    SearchTerm: {
        type: String,
        hashKey: true
    },
    StatName: {
        type: String,
        rangeKey: true,
        index: true
    },
    Tweets: {
        type: 'list',
        list: [{
            type: 'map',
            map: {
                hashtags: {
                    type: [String]
                },
                has_media: {
                    type: Boolean,
                    default: false
                },
                parent_tweet_id: {
                    type: String
                },
                is_replied: {
                    type: Boolean,
                    default: false
                },
                url: {
                    type: String
                },
                is_reply_to: {
                    type: Boolean,
                    default: false
                },
                video_url: {
                    type: String
                },
                replies: {
                    type: Number
                },
                screen_name: {
                    type: String 
                },
                user_id: {
                    type: String
                },
                img_urls: {
                    type: [String]
                },
                html: {
                    type: String
                },
                links: {
                    type: [String]
                },
                reply_to_users: {
                    type: [String]
                },
                id: {
                    type: String
                },
                text: {
                    type: String
                },
                timestamp_epochs: {
                    type: Number
                },
                retweets: {
                    type: Number
                },
                username: {
                    type: String
                },
                timestamp: {
                    type: String
                },
                likes: {
                    type: Number
                }
            }
        }]
    }},
    {
        useDocumentTypes: true,
        throughput: {read: 15, write: 5}
    }
);