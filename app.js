var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var fs = require("fs");

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://arthit75420:0825410282@localhost:27017/";

function getMaxID(data) {
   var max = 0;
   Object.keys(data).forEach(function (key) {
      if (data[key].id > max) max = data[key].id;
   });
   return max;
}

app.get('/', function (req, res) {
   res.send("Sample Code for RESTful API");
});
app.use(bodyParser.json());

app.post('/receiveData', function (req, res) {
   MongoClient.connect(url, function(err, db) {
     if (err) throw err;
     var dbo = db.db("hwData");
     var data = req.body.DevEUI_uplink;
     var reciveTime = data.Time;
     var frames = data.payload_parsed.frames;
     var myobj = { teamID: String(frames[1].value), temp: String(frames[0].value) };
     dbo.collection("temperature").insertOne(myobj, function(err, res) {
       if (err) throw err;
       console.log(myobj);
       console.log("1 document inserted");
       res.end("1 document inserted");
       db.close();
     });
   });
})

app.get('/showData', function (req, res) {
   MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("hwData");
      dbo.collection("temperature").find({}).toArray(function(err, result) {
        if (err) throw err;
        res.end(JSON.stringify(result));
        db.close();
      });
    });
   
})


app.post('/addData', function (req, res) {
   MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("hwData");
      var myobj = { teamID: req.body.temp, temp: req.body.teamID };
      dbo.collection("temperature").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log(myobj);
        console.log("1 document inserted");
        res.end("1 document inserted");
        db.close();
      });
    });
})

app.put('/editData/:teamID',function(req, res){
   MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("hwData");
      var id = req.params.teamID;
      var myquery = { teamID: id };
      var myobj = { $set: { teamID: req.body.temp, temp: req.body.teamID } };
      dbo.collection("temperature").updateOne(myquery, myobj, function(err, res) {
         if (err) throw err;
         console.log("1 document updated");
         res.end("1 document updated");
         db.close();
       });
    });
})

app.delete('/deleteData/:teamID', function (req, res) {
   MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("hwData");
      var id = req.params.teamID;
      var myquery = { teamID: id };
      dbo.collection("temperature").deleteOne(myquery, function(err, res) {
         if (err) throw err;
         console.log("1 document updated");
         res.end("1 document updated");
         db.close();
       });
    });
})

var server = app.listen(8080, function () {
   var port = server.address().port
   console.log("Example app listening at http://localhost:%s", port)
})