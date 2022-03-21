

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

const expressPort = process.env.PORT || 5001;

const mySqlHost = process.env.SQL_HOST;
const mySqlUser = process.env.SQL_USER;
const mySqlPass = process.env.SQL_PASSWORD;
const mySqlDatabase = process.env.SQL_DATABASE;


const db_configt = {
  host: mySqlHost,
  user: mySqlUser,
  password: mySqlPass,
  database: mySqlDatabase
}


let db;






function handleDisconnect() {
    console.log('handleDisconnect()');
    db = mysql.createConnection({
  host: mySqlHost,
  user: mySqlUser,
  password: mySqlPass,
  database: mySqlDatabase
}); // Recreate the connection, since
                                                    // the old one cannot be reused.
    db.connect(function(err) {              // The server is either down
    if(err) {                                      // or restarting (takes a while sometimes).
        console.log(' Error when connecting to db:', err);
        setTimeout(handleDisconnect, 2000);         // We introduce a delay before attempting to reconnect,
    }                                               // to avoid a hot loop, and to allow our node script to
    });                                             // process asynchronous requests in the meantime.
                                                    // If you're also serving http, display a 503 error.

    db.on('error', function(err) {
        console.log('db error: ' + err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                       // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                // server variable configures this)
        }
    });

}

handleDisconnect();



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
        if (error){
          console.log("ERROR!!! ", error);
          throw error;
          handleDisconnect();
        } 
        numRows = dbresults[0].numRows;
        numPages = Math.ceil(numRows / limit) -1;
      });

      db.query(queryString, function (error, dbresults,) {
        if (error){
          console.log("ERROR!!! ", page, limit);
          throw error;
          handleDisconnect();
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
    res.json(res.paginatedResults);
  });


app.use(express.static(path.join(__dirname, './client/build')))

app.get('*', function(_, res) {
  res.sendFile(path.join(__dirname, './client/build/index.html'), function(err) {
    if (err) {
      res.status(500).send(err);
      handleDisconnect();
    }
  })
})

  



app.listen(expressPort, () => {
  console.log(`Express Server started on port ${expressPort}`);
})