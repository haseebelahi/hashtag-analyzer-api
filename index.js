const express = require('express');
const cors = require('cors');
const AWS = require("aws-sdk");

AWS.config.update({
  region: "eu-west-2",
  endpoint: "http://localhost:8000"
});

const app = express();

app.use(cors());

// app.use(express.urlencoded());

require('./routes/tweetRoutes')(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT);