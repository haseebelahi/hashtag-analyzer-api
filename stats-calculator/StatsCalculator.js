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
            tweets = tweets.sort((a, b) => sort == 'desc' ? (b[sortBy] - a[sortBy]) : (a[sortBy] - b[sortBy])).slice(0, this.TOP_N);
            const tweetsDTOList = [];
            tweets.forEach(tweet => {
                const regEx = new RegExp('href="/', "g");
                tweet.html = tweet.html.replace(regEx, 'href="https://twitter.com/');
                tweetsDTOList.push(new TweetDTO(tweet));
            });
            topN[sortBy] = tweetsDTOList;
        });
        return topN;
    }

    getTotalTweetCount() {
        return this.tweets.length;
    }

    getUniqueUsersTweeting() {
        const tweets = this.tweets.slice();
        const uniqueUsers = tweets.sort((a, b) => a.time - b.time).reduce((unique, item) => {
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
    
    getTweetCountInFirst5Minutes() {
        let tweets = this.tweets.slice();
        tweets = tweets.sort((a, b) => (a['time'] - b['time']));
        const startTime = tweets[0].time;
        // console.log('Start Time: ' + startTime.format('LLLL'));
        const endTime = startTime.add(5, 'm');
        // console.log('End Time: ' + endTime.format('LLLL'));
        let first5MinCount = 0;
        tweets.forEach(tweet => {
            // console.log('This tweet time: ' + tweet.time.format('LLLL'));
            if(tweet.time <= endTime) {
                console.log('counting in');
                first5MinCount++;
            }
        });
        return first5MinCount;
    }

    getTweetsPerHour() {
        const labels = [];
        const data = [];
        const highestLikesData = [];
        const tweets = this.tweets.slice();
        tweets.sort((a, b) => a.time - b.time);
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
        tweets.sort((a, b) => b.likes - a.likes).splice(0, 1).forEach(tweet => {
            let tweetTime = moment(tweet.time);
            const hour = tweetTime.format('D-M-YY hA') + ' - ' + tweetTime.add(1, 'h').format('hA');
            labels.forEach(label => {
                if(label == hour) {
                    highestLikesData.push({
                        x: hour,
                        y: hash[hour].y,
                        r: 8,
                        likes: tweet.likes,
                        time: tweet.time.format('h:mA'),
                        username: tweet.username
                    });
                } else {
                    highestLikesData.push({});
                }
            });
        });
        return {labels: labels, data: data, highestLikesData: highestLikesData};
    }
}
const parseTime = tweets => tweets.forEach(tweet => tweet.time = moment(tweet.timestamp+'Z'));

module.exports = StatsCalculator;