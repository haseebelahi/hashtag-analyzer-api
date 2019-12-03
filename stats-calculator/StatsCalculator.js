const moment = require('moment');
const TweetDTO = require('../models/TweetDTO');
const UserDTO = require('../models/UserDTO');

class StatsCalculator {

    TOP_N_BY =  [{name: 'likes', sort: 'desc'}, {name: 'retweets', sort: 'desc'}, {name: 'time', sort: 'asc'}];

    constructor(tweets, TOP_N) {
        this.tweets = tweets;
        this.TOP_N = TOP_N;
        parseTime(this.tweets);
    }

    getTopN() {
        const topN = {};
        this.TOP_N_BY.forEach(by => {
            const sortBy = by.name;
            const sort = by.sort;
            let tweets = this.tweets.slice();
            tweets = tweets.sort((a, b) => {
                if (sortBy == 'time') {
                    return sort == 'desc' ? (b[sortBy].diff(a[sortBy])) : (a[sortBy].diff(b[sortBy]));
                } else {
                    return sort == 'desc' ? (b[sortBy] - a[sortBy]) : (a[sortBy] - b[sortBy]);
                }
            }).slice(0, this.TOP_N);
            const tweetsDTOList = [];
            tweets.forEach(tweet => {
                const regEx = new RegExp('href="/', "g");
                tweet.html = tweet.html.replace(regEx, 'href="https://twitter.com/');
                tweetsDTOList.push(new TweetDTO(tweet));
            });
            topN[sortBy] = tweetsDTOList;
        });
        this.topN = topN;
        return topN;
    }

    getTopTweeters() {
        let tweetsByUser = groupBy(this.tweets.slice(), 'screen_name');
        let tweetCountByUser = [];
        for(let key in tweetsByUser) {
            tweetCountByUser.push({
                username: tweetsByUser[key][0]['username'],
                screen_name: tweetsByUser[key][0]['screen_name'],
                id: tweetsByUser[key][0]['user_id'],
                num_of_tweets: tweetsByUser[key].length
            });
        }
        return tweetCountByUser.sort((a, b) => b.num_of_tweets - a.num_of_tweets).slice(0, 10);
    }

    getTotalTweetCount() {
        return this.tweets.length;
    }

    getUniqueUsersTweeting() {
        const tweets = this.tweets.slice();
        const uniqueUsers = tweets.sort((a, b) => a.time.diff(b.time)).reduce((unique, item) => {
            // console.log(item, unique, unique.some(x => x.username == item.username), unique.some(x => x.username == item.username) ? unique : [...unique, item]);
            return unique.some(x => x.username == item.username) ? unique : [...unique, item];
        }, []).map(item => {
            return new UserDTO(item);
        });
        return uniqueUsers.slice();
    }

    getTotalUsersTweeting() {
        return this.getUniqueUsersTweeting().length;
    }

    getHashTagStarters() {
       return this.getUniqueUsersTweeting().slice(0, this.TOP_N);
    }
    
    getMostTweetsInAMinute() {
        let tweets = []
        this.tweets.forEach(tweet => {
            tweet = Object.assign({}, tweet)
            tweet.time = tweet.time.format('LLLL');
            tweets.push(tweet);
        });
        const groupedByTime = groupBy(tweets, 'time');
        const tweetCountByTime = [];
        for(let key in groupedByTime) {
            tweetCountByTime.push({
                time: groupedByTime[key][0]['time'],
                timestamp: groupedByTime[key][0]['timestamp'] + 'Z',
                num_of_tweets: groupedByTime[key].length
            });
        }
        this.mostTweetsInAMinute = tweetCountByTime.sort((a, b) => b.num_of_tweets - a.num_of_tweets).slice(0, 1);
        return this.mostTweetsInAMinute;
    }

    getTotalRetweets() {
        let totalRetweets = 0;
        this.tweets.forEach(tweet => {
            totalRetweets += tweet.retweets;
        });
        return totalRetweets;
    }

    getTotalLikes() {
        let totalLikes = 0;
        this.tweets.forEach(tweet => {
            totalLikes += tweet.likes;
        });
        return totalLikes;
    }
    getTweetsPerHour() {
        const labels = [];
        const data = [];
        const highestLikesData = [];
        const highestRetweetsData = [];
        const mostTweetsInAMinData = [];
        const tweets = this.tweets.slice();
        tweets.sort((a, b) => a.time.diff(b.time));
        let hash = {};
        tweets.forEach(tweet => {
            let tweetTime = moment(tweet.time);
            let key = tweetTime.format('D-M-YY hA') + ' - ' + tweetTime.add(1, 'h').format('hA');
            if(!hash[key]) {
                hash[key] = {x: key, y: 0}
            }
            hash[key].y += 1;
        });
        for (let prop in hash) {
            labels.push(prop);
            data.push(hash[prop].y);
        }
        
        const mostLikedTweet = this.topN['likes'].slice(0, 1)[0];
        const mostRetweetedTweet = this.topN['retweets'].slice(0, 1)[0];
        const mostTweetsInAMinute = this.mostTweetsInAMinute[0];
        let tweetTime = moment(mostLikedTweet.timestamp);
        const likesHour = tweetTime.format('D-M-YY hA') + ' - ' + tweetTime.add(1, 'h').format('hA');
        tweetTime = moment(mostRetweetedTweet.timestamp);
        const retweetsHour = tweetTime.format('D-M-YY hA') + ' - ' + tweetTime.add(1, 'h').format('hA');
        tweetTime = moment(mostTweetsInAMinute.timestamp);
        const mostTweetsHour = tweetTime.format('D-M-YY hA') + ' - ' + tweetTime.add(1, 'h').format('hA');
        
        labels.forEach(label => {
            if(label == likesHour) {
                highestLikesData.push({
                    x: likesHour,
                    y: hash[likesHour].y,
                    r: 8,
                    likes: mostLikedTweet.likes,
                    time: moment(mostLikedTweet.timestamp).format('h:mA'),
                    username: mostLikedTweet.username
                });
            } else {
                highestLikesData.push({});
            }
            if(label == retweetsHour) {
                highestRetweetsData.push({
                    x: retweetsHour,
                    y: hash[retweetsHour].y,
                    r: 10,
                    retweets: mostRetweetedTweet.retweets,
                    time: moment(mostRetweetedTweet.timestamp).format('h:mA'),
                    username: mostRetweetedTweet.username
                });
            } else {
                highestRetweetsData.push({});
            }
            if(label == mostTweetsHour) {
                mostTweetsInAMinData.push({
                    x: mostTweetsHour,
                    y: hash[mostTweetsHour].y,
                    r: 6,
                    tweets: mostTweetsInAMinute.num_of_tweets,
                    time: moment(mostTweetsInAMinute.timestamp).format('h:mmA'),
                });
            }
            else {
                mostTweetsInAMinData.push({});
            }
        });
        return {labels: labels, data: data, highestLikesData: highestLikesData, highestRetweetsData: highestRetweetsData, mostTweetsInAMinData: mostTweetsInAMinData};
    }
}

const groupBy = function(xs, key) {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };
const parseTime = tweets => tweets.forEach(tweet => tweet.time = moment(tweet.timestamp+'Z'));

module.exports = StatsCalculator;