const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const StatsCalculator = require('../stats-calculator/StatsCalculator');
const STATS = {
    'retweets': 'TopNByRetweets',
    'likes': 'TopNByLikes',
    'first': 'FirstNTweets',
    'important_users': 'TopImportantUsers',
    'all_tweets': 'AllTweets',
    'word_frequency': 'WordFrequency',
    'common_links': 'CommonLinks'
}

const queryDB = (searchTerm, lastEvaluatedKey) => {
    return new Promise((resolve, reject) => {
        let params = {
            TableName : "SearchTermStats",
            FilterExpression: "#SearchTerm = :SearchTerm",
            ExpressionAttributeNames:{
                "#SearchTerm": "SearchTerm"
            },
            ExpressionAttributeValues: {
                ":SearchTerm": searchTerm
            }
        };
        if(lastEvaluatedKey) {
            params['ExclusiveStartKey'] = lastEvaluatedKey;
        }
        docClient.scan(params, (err, data) => {
            if(err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

const getData = async (searchTerm) => {
    console.log(searchTerm);
    return new Promise(async (resolve, reject) => {
        let allData = {};
        let lastEvaluatedKey = null;
        let moreDataAvailable = true;
        while(moreDataAvailable) {
            try {
                const data = await queryDB(searchTerm, lastEvaluatedKey);
                if(allData['Items']) {
                    allData['Items'] = allData['Items'].concat(data['Items']);
                } else {
                    allData['Items'] = data['Items'];
                }
                if(data['LastEvaluatedKey']) {
                    lastEvaluatedKey = data['LastEvaluatedKey'];
                    moreDataAvailable = true;
                } else {
                    moreDataAvailable = false; 
                }
            }
            catch(err) {
                reject(err);
            }
            
        }
        resolve(allData);
    });
}


module.exports = app => {
    app.get('/api/allstats/:hashtag', async (req, res) => {
        try {
            console.log(req.params.hashtag);
            let data = await getData('#' + req.params.hashtag);
            let allTweets = [];
            let wordFreq = [];
            let commonLinks = [];
            data.Items.forEach(item => {
                if (item['StatName'] == STATS['all_tweets']) {
                    allTweets = allTweets.concat(item['Tweets']);
                } else if(item['StatName'] == STATS['word_frequency']) {
                    wordFreq = item[STATS['word_frequency']];
                } else if(item['StatName'] == STATS['common_links']) {
                    commonLinks = item[STATS['common_links']];
                }
            });
            const statsCalculator = new StatsCalculator(allTweets, 25);
            const allStats = {};
            allStats['topN'] = statsCalculator.getTopN();
            allStats['totalTweets'] = statsCalculator.getTotalTweetCount();
            allStats['hashtagStarters'] = statsCalculator.getHashTagStarters();
            allStats['totalUsersTweeting'] = statsCalculator.getTotalUsersTweeting();
            allStats['tweetCountInFirst5'] = statsCalculator.getMostTweetsInAMinute();
            allStats['tweetsPerHour'] = statsCalculator.getTweetsPerHour();
            allStats['wordFreq'] = wordFreq;
            allStats['commonLinks'] = commonLinks;
            allStats['topTweeters'] = statsCalculator.getTopTweeters();
            allStats['totalLikes'] = statsCalculator.getTotalLikes();
            allStats['totalRetweets'] = statsCalculator.getTotalRetweets();
            res.send(allStats);
        }
        catch(err) {
            console.log(err);
            res.status(500).send('something went wrong');
        }
    });
  };