const { App } = require("@slack/bolt");
const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');

const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv');
const express = require('express');
const mysql = require("mysql");
const cors = require('cors');
const path = require("path");



const corsoption = {
  origin: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  exposedHeaders: ["x-auth-token"]
};

const app = express();
app.use(cors(corsoption));
app.options('*', cors());
dotenv.config();

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackToken = process.env.SLACK_TOKEN;
const slackPort = 5000;
const expressPort = process.env.PORT || 5001;

const mySqlHost = process.env.SQL_HOST;
const mySqlUser = process.env.SQL_USER;
const mySqlPass = process.env.SQL_PASSWORD;
const mySqlDatabase = process.env.SQL_DATABASE;



const db = mysql.createConnection({
  host: mySqlHost,
  user: mySqlUser,
  password: mySqlPass,
  database: mySqlDatabase
})

db.connect();
const slackEvents = createEventAdapter(slackSigningSecret);
const slackClient = new WebClient(slackToken);


  // Exprees will serve up production assets
  app.use(express.static('client/build'));

  // Express serve up index.html file if it doesn't recognize route
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });

slackEvents.on('app_mention', (event) => {
  console.log(`Got message from user ${event.user}: ${event.text}`);
  console.log(event);

  

  Promise.all([
    (async () => {
      const realName = await getUserName(event.user);

      const sqlInsert = `INSERT INTO saved_comments (user, comment) VALUES ('${realName}', '${cleanString(event.text)}');`
  
    await db.query(sqlInsert, (error, result) => {
      if (error) throw error;
    });
  })(),
  (async () => {
      try { 
        console.log("Message saved");
        await slackClient.chat.postMessage({ channel: event.channel, text: `<@${event.user}>! Message saved!` })
      } catch (error) {
        console.log(error.data)
      }
    })()

  ]);


});

const cleanString = (str) => {
  let cleanString = str.replace('<@U033521BD5W>', "").replace(/`/g, "").trim();
  return cleanString;
}


const getUserName = async (userId) => {

  try {
  // Call the users.info method using the WebClient
  const result = await slackClient.users.info({
    user: userId
  });

  return await ( result.user.profile.real_name_normalized)
}
catch (error) {
  console.error(error);
}
}

  const paginatedResults =() => {
    return (req, res, next) => {
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      const sort = req.query.sortTerm;
      console.log("Sort: ", sort);
      const sortDir = req.query.sortDir;

      const startIndex = (page) * limit;
      const endIndex = page * limit;
      console.log("End Index: ", endIndex);

      const results = {}
      let queryString = '';

      if(!sort){
        queryString = `SELECT* FROM saved_comments LIMIT ${page*limit},${limit};`
      } else {
        queryString =  `SELECT* FROM saved_comments ORDER BY ${sort} ${sortDir} LIMIT ${page*limit},${limit};`
      }

      db.query('SELECT count(*) as numRows FROM saved_comments', function (error, dbresults) {
        numRows = dbresults[0].numRows;
        numPages = Math.ceil(numRows / limit) -1;
      });

      db.query(queryString, function (error, dbresults,) {
        if (error){
          console.log("ERROR!!! ", page, limit);
          throw error;
        } 
        const unpaginatedResults = JSON.stringify(dbresults);  
        console.log("Length: ", dbresults.length);   

      if (page < numPages) {
        console.log("Pages are equal")
        results.next = {
          page: page+1,
          limit: limit
        }
      }

      if (startIndex > 0){
        results.previous = {
          page: page -1,
          limit: limit
        }
      }

      results.results = unpaginatedResults;

      console.log("Results: ", results);
      res.paginatedResults = results;
      next();
      });
    }
  }


  app.get('/comments', paginatedResults(), (req, res) => {
    console.log(res.paginatedResults);
    res.json(res.paginatedResults);
  });



  

slackEvents.on('error', console.error);

slackEvents.start(slackPort).then(() => {
  console.log(`SlackEvents Server started on port ${slackPort}`)
});

app.listen(expressPort, () => {
  console.log(`Express Server started on port ${expressPort}`);
})